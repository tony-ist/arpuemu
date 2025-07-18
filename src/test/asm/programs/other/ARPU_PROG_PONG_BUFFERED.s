// Ping pong for 2 players with buffered screen

imm r1 .draw_buffer
pst r1 1
pst r1 1 // clear screen

.left_paddle
imm r1 0b011_000_00

.right_paddle
imm r2 0b011_111_00

imm r3 0
str r1 r3
inc r3
str r2 r3

.speed
imm r3 .vec_down_right

.ball
imm r4 0b100_001_00

push r3
push r4

.loop
pld r4 0
// imm r4 0 // debug

.load_paddles_coords
imm r3 0
lod r1 r3
inc r3
lod r2 r3

.check_left_down
imm r3 0b0000_0001
and r3 r4
jz .check_left_up

.left_paddle_move_down
imm r3 .vec_down
add r1 r3
jmp .check_right_down

.check_left_up
imm r3 0b0000_0010
and r3 r4
jz .check_right_down

.left_paddle_move_up
imm r3 .vec_up
add r1 r3

.check_right_down
imm r3 0b0000_0100
and r3 r4
jz .check_right_up

.right_paddle_move_down
imm r3 .vec_down
add r2 r3
jmp .store_paddles_coords

.check_right_up
imm r3 0b0000_1000
and r3 r4
jz .store_paddles_coords

.right_paddle_move_up
imm r3 .vec_up
add r2 r3

.store_paddles_coords
imm r3 0
str r1 r3
inc r3
str r2 r3

// r1 should be left paddle coord
// r2 should be right paddle coord
// stack[0] should be ball coord
.draw
imm r4 .vec_down
pst r1 1
add r1 r4
pst r1 1 // left paddle
sub r1 r4

pst r2 1
add r4 r2
pst r4 1 // right paddle

pop r3
push r3
pst r3 1 // ball

imm r4 .draw_buffer
pst r4 1

.move_ball
pop r4 // ball coordinate

.check_win_condition
imm r1 0b000_111_00
and r1 r4
imm r2 0b000_001_00
sub r1 r2
// if ball x == 1
jz .check_player2_win

imm r1 0b000_111_00
and r1 r4
imm r2 0b000_110_00
sub r1 r2
// if ball x == 6
jz .check_player1_win 
jmp .check_y_collisions

.check_player2_win

// if ball's left square is empty,
// then player 2 wins

// check_left_paddle_top
imm r2 0
lod r1 r2 // left paddle coord
mov r2 r1
sub r2 r4
imm r3 .vec_up_left
sub r2 r3
jz .check_y_collisions

.check_left_paddle_bot
sub r1 r4
imm r3 .vec_left
sub r1 r3
jz .check_y_collisions

.player2_won
imm r1 2
pst r1 0
halt

.check_player1_win

// if ball's right square is empty,
// then player 1 wins

// check_right_paddle_top
imm r2 1
lod r1 r2 // right paddle coord
mov r2 r1
sub r2 r4
imm r3 .vec_up_right
sub r2 r3
jz .check_y_collisions

.check_right_paddle_bot
sub r1 r4
imm r3 .vec_right
sub r1 r3
jz .check_y_collisions

.player1_won
imm r1 1
pst r1 0
halt

.check_y_collisions
pop r3
mov r3 r3
jnm .moving_down

.moving_up
add r4 r3
jc .check_x_right_collision

.moving_up_y_collision
imm r1 0b010_000_00
add r3 r1 // reflect vector from up to down
imm r1 .vec_down_down
add r4 r1
jmp .check_x_right_collision

.moving_down
add r4 r3
jnc .check_x_right_collision

.moving_down_y_collision
imm r1 0b110_000_00
add r3 r1 // reflect vector from down to up
imm r1 .vec_up_up
add r4 r1

.check_x_right_collision
imm r1 0b000_111_00
mov r2 r4
and r2 r1
sub r2 r1
jnz .check_x_left_collision

.x_right_collision
imm r1 0b111_110_00
add r3 r1 // reflect vec from right to left
imm r1 .vec_left_left
add r4 r1

.check_x_left_collision
imm r1 0b000_111_00
and r1 r4
jnz .move_ball_end

.x_left_collision
imm r1 0b000_010_00
add r3 r1 // reflect vec from left to right
imm r1 .vec_right_right
add r4 r1

.move_ball_end
push r3
push r4

jmp .loop

.draw_buffer
dw 0b000_000_10

.vec_up
dw 0b111_000_00 // vector (-1, 0)

.vec_down
dw 0b001_000_00 // vector (1, 0)

.vec_left
dw 0b111_111_00 // vector (0, -1)

.vec_right
dw 0b000_001_00 // vector (0, 1)

.vec_down_right
dw 0b001_001_00 // vector (1, 1)

.vec_up_right
dw 0b111_001_00 // vector (-1, 1)

.vec_down_left
dw 0b000_111_00 // vector (1, -1)

.vec_up_left
dw 0b110_111_00 // vector (-1, -1)

.vec_up_up
dw 0b110_000_00 // vector (-2, 0)

.vec_down_down
dw 0b010_000_00 // vector (2, 0)

.vec_left_left
dw 0b111_110_00 // vector (0, -2)

.vec_right_right
dw 0b000_010_00 // vector (0, 2)