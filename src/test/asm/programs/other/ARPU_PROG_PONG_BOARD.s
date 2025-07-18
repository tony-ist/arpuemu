// Ping pong for 2 players

.clear_screen
imm r1 0b000_000_10
pst r1 0 

.draw_bottom_board
imm r1 0b111_011_01
imm r2 .xoffset
pst r1 0
add r1 r2
pst r1 0

.loop
pld r3 0

imm r4 1
sub r4 r3
jz .left

imm r4 2
sub r4 r3
jz .right

jmp .loop

.left
dec r1
pst r1 0 // clear pixel
inc r1 
sub r1 r2 // move left
sub r1 r2
pst r1 0 // draw pixel
add r1 r2
jmp .loop

.right
sub r1 r2 // move left
dec r1
pst r1 0 // clear pixel
inc r1
add r1 r2
add r1 r2
pst r1 0 // draw pixel
jmp .loop

.xoffset
dw 0b000_001_00
