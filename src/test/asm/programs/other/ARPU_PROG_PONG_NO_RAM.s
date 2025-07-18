// Ping pong for 2 players

.clear_screen
imm r1 0b000_000_10
pst r1 0 

imm r3 .yoffset

.draw_left_board
imm r1 0b011_000_01
pst r1 0
add r1 r3
pst r1 0

.draw_right_board
imm r2 0b011_111_01
pst r2 0
add r2 r3
pst r2 0

.draw_ball
imm r4 .vec_down_right
// imm r4 .vec_down_left
// imm r4 .vec_up_left
// imm r4 .vec_up_right
push r4
// imm r4 0b100_001_01
imm r4 0b011_001_01 // debug
pst r4 0
push r4

.loop
// pld r4 0
imm r4 0 // debug

// check left and right board
// on movement up or down

.check_left_down
imm r3 0b0000_0001
and r3 r4
jz .check_left_up
cal .left_board_move_down
jmp .check_right_down

.check_left_up
imm r3 0b0000_0010
and r3 r4
jz .check_right_down
cal .left_board_move_up

.check_right_down
imm r3 0b0000_0100
and r3 r4
jz .check_right_up
cal .right_board_move_down
jmp .move_ball

.check_right_up
imm r3 0b0000_1000
and r3 r4
jz .move_ball
cal .right_board_move_up

.move_ball
pop r4 // ball coordinate
pop r3 // speed vector

// check y collisions
// if vector up and no collision then CF = 1
// if vector up and collision then CF = 0
// if vector down and no collision then CF = 0
// if vector down and collision then CF = 1

mov r3 r3
jnm .moving_down

.moving_up
dec r4 // clear pixel command
pst r4 0 // clear previous ball
inc r4 // set pixel command
add r4 r3 // move ball
jc .check_x_right_collision // if no collision

.moving_up_y_collision
cal .reflect_up_down
push r3
imm r3 .vec_down_down
add r4 r3
pop r3
jmp .check_x_right_collision 

.moving_down
dec r4 // clear pixel command
pst r4 0 // clear previous ball
inc r4 // set pixel command
add r4 r3 // move ball
jnc .check_x_right_collision

.moving_down_y_collision
cal .reflect_up_down
push r3
imm r3 .vec_up_up
add r4 r3
pop r3

// check x collisions
.check_x_right_collision
push r3
imm r3 0b000_111_00
and r3 r4
push r2
imm r2 0b000_111_00
sub r3 r2
pop r2
pop r3
jnz .check_x_left_collision

.x_right_collision
push r3

// check win condition
// if r4 == r2 or r4 == r2 + 1 then bounce
// else player 1 wins

push r4
sub r4 r2
pop r4
jz .bounce_right_board

imm r3 0b001_000_00
add r2 r3
push r4
sub r4 r2
pop r4
jz .bounce_right_board

// todo draw losing ball on edge
.player1_wins
imm r3 1
pst r3 1
halt

.bounce_right_board
sub r2 r3
imm r3 .vec_left_left
add r4 r3
pop r3
cal .reflect_left_right
jmp .move_ball_end

.check_x_left_collision
push r3
imm r3 0b000_111_00
and r3 r4
pop r3
jnz .move_ball_end

.x_left_collision
push r3

// check win condition
// if r4 == r1 or r4 == r1 + 1 then bounce
// else player 2 wins

push r4
sub r4 r1
pop r4
jz .bounce_left_board

imm r3 0b001_000_00
add r1 r3
push r4
sub r4 r1
pop r4
jz .bounce_left_board

.player2_wins
imm r3 2
pst r3 1
halt

.bounce_left_board
imm r3 .vec_right_right 
add r4 r3
pop r3
cal .reflect_left_right

.move_ball_end
pst r4 0
push r3
push r4
jmp .loop

// todo inline these procedures if space is required
.left_board_move_up
imm r3 .yoffset
dec r1
pst r1 0 // clear pixel
inc r1 
sub r1 r3 // move up
sub r1 r3
pst r1 0 // draw pixel
add r1 r3 // move down
ret

.left_board_move_down
imm r3 .yoffset
sub r1 r3 // move up
dec r1
pst r1 0 // clear pixel
inc r1
add r1 r3
add r1 r3 // move down
pst r1 0 // draw pixel
ret

.right_board_move_up
imm r3 .yoffset
dec r2
pst r2 0 // clear pixel
inc r2 
sub r2 r3 // move up
sub r2 r3
pst r2 0 // draw pixel
add r2 r3 // move down
ret

.right_board_move_down
imm r3 .yoffset
sub r2 r3 // move up
dec r2
pst r2 0 // clear pixel
inc r2
add r2 r3
add r2 r3 // move down
pst r2 0 // draw pixel
ret

// loads vertically reflected r3 vector into r3
// if r3 == vec_up_left
// then r3 = vec_down_left
// if r3 == vec_up_right
// then r3 = vec_down_right
// and so on
.reflect_up_down
push r4
mov r3 r3
jmb .from_up_to_down

imm r4 0b110_000_00
jmp .end_reflect_up_down

.from_up_to_down
imm r4 0b010_000_00

.end_reflect_up_down
add r3 r4
pop r4
ret

// loads horizontally reflected r3 vector into r3
.reflect_left_right
push r4
imm r4 0b000_110_00
and r4 r3
jnz .from_left_to_right

imm r4 0b111_110_00
jmp .end_reflect_left_right

.from_left_to_right
imm r4 0b000_010_00

.end_reflect_left_right
add r3 r4
pop r4
ret

.yoffset
dw 0b001_000_00

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

// todo remove unnecessary stack operations
// todo make draws closer to each other
// todo store board positions in ram to free r1/r2