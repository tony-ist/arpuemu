// Ping pong for 2 players with non-buffered screen

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

imm r4 0
str r1 r4
inc r4
str r2 r4

.draw_ball
imm r4 .vec_down_right
// imm r4 .vec_down_left
// imm r4 .vec_up_left
// imm r4 .vec_up_right
push r4
// imm r4 0b100_001_01
imm r4 0b100_110_01 // debug
pst r4 0
push r4

.loop
pld r4 0
// imm r4 0 // debug

// check left and right board
// on movement up or down

.load_board_coords
imm r3 0
lod r1 r3 // left board bottom coord 
inc r3
lod r2 r3 // right board bottom coord

.check_left_down
imm r3 0b0000_0001
and r3 r4
jz .check_left_up

.left_board_move_down
imm r3 .yoffset
sub r1 r3 // move up
dec r1
pst r1 0 // clear pixel
inc r1
add r1 r3
add r1 r3 // move down
pst r1 0 // draw pixel
jmp .check_right_down

.check_left_up
imm r3 0b0000_0010
and r3 r4
jz .check_right_down

.left_board_move_up
imm r3 .yoffset
dec r1
pst r1 0 // clear pixel
inc r1 
sub r1 r3 // move up
sub r1 r3
pst r1 0 // draw pixel
add r1 r3 // move down

.check_right_down
imm r3 0b0000_0100
and r3 r4
jz .check_right_up

.right_board_move_down
imm r3 .yoffset
sub r2 r3 // move up
dec r2
pst r2 0 // clear pixel
inc r2
add r2 r3
add r2 r3 // move down
pst r2 0 // draw pixel
jmp .move_ball

.check_right_up
imm r3 0b0000_1000
and r3 r4
jz .save_board_coords

.right_board_move_up
imm r3 .yoffset
dec r2
pst r2 0 // clear pixel
inc r2 
sub r2 r3 // move up
sub r2 r3
pst r2 0 // draw pixel
add r2 r3 // move down

.save_board_coords
imm r4 0
str r1 r4
inc r4
str r2 r4

.move_ball
pop r4 // ball coordinate
pop r3 // speed vector

.check_win_condition
imm r1 0b000_111_00
and r1 r4
imm r2 0b000_001_00
sub r1 r2
// if on line x = 0b001
jz .check_player_win

imm r1 0b000_111_00
and r1 r4
imm r2 0b000_110_00
sub r1 r2
// if on line x = 0b110
jz .check_player_win 
jmp .check_y_collisions

.check_player_win
// if ball's left and right squares are empty,
// then halt

imm r1 0
cal .side_block_present
jz .check_y_collisions

imm r1 1
cal .side_block_present
jz .check_y_collisions

.game_end
halt

.check_y_collisions
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
imm r1 .vec_down_down
add r4 r1
jmp .check_x_right_collision 

.moving_down
dec r4 // clear pixel command
pst r4 0 // clear previous ball
inc r4 // set pixel command
add r4 r3 // move ball
jnc .check_x_right_collision

.moving_down_y_collision
cal .reflect_up_down
imm r1 .vec_up_up
add r4 r1

// check x collisions
.check_x_right_collision
imm r1 0b000_111_00
and r1 r4
imm r2 0b000_111_00
sub r1 r2
jnz .check_x_left_collision

.x_right_collision
imm r1 1
lod r2 r1 // r2 = right board bottom coordinate

.bounce_right_board
imm r1 .vec_left_left
add r4 r1
cal .reflect_left_right
jmp .move_ball_end

.check_x_left_collision
imm r1 0b000_111_00
and r1 r4
jnz .move_ball_end

.x_left_collision
imm r1 1
lod r2 r1 // r2 = left board bottom coordinate

.bounce_left_board
imm r1 .vec_right_right 
add r4 r1
cal .reflect_left_right

.move_ball_end
pst r4 0
push r3
push r4
jmp .loop

// loads vertically reflected r3 vector into r3
// if r3 == vec_up_left
// then r3 = vec_down_left
// if r3 == vec_up_right
// then r3 = vec_down_right
// and so on
.reflect_up_down
mov r3 r3
jmb .from_up_to_down

imm r1 0b110_000_00
jmp .end_reflect_up_down

.from_up_to_down
imm r1 0b010_000_00

.end_reflect_up_down
add r3 r1
ret

// loads horizontally reflected r3 vector into r3
.reflect_left_right
imm r1 0b000_110_00
and r1 r3
jnz .from_left_to_right

imm r1 0b111_110_00
jmp .end_reflect_left_right

.from_left_to_right
imm r1 0b000_010_00

.end_reflect_left_right
add r3 r1
ret

// arg r1 = 0 if left board, 1 if right board
.side_block_present
lod r2 r1 
// r2 = left or right board bottom coordinate
imm r1 0b111_000_00
and r2 r1
imm r1 0b111_000_00
and r1 r4
sub r1 r2
jz .end_side_block_present

imm r1 0b001_000_00
sub r2 r1
imm r1 0b111_000_00
and r2 r1
imm r1 0b111_000_00
and r1 r4
sub r1 r2 // board_y - 1 == block_y

.end_side_block_present
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

// todo make draws closer to each other or do buffering instead