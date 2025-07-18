imm r4 0b000_000_10 // Draw buffer command
pst r4 1
pst r4 1 // Clear screen

imm r1 0b100_100_00 // Cursor coordinate

.loop
pst r1 1 // Draw new pixel
pst r4 1 // Draw buffer
pld r2 0

imm r3 1
sub r3 r2
jz .up

imm r3 2
sub r3 r2
jz .down

imm r3 4
sub r3 r2
jz .left

imm r3 8
sub r3 r2
jz .right

jmp .loop

.up
imm r3 .vy
sub r1 r3
jmp .loop

.down 
imm r3 .vy
add r1 r3
jmp .loop

.left 
imm r3 .vx
sub r1 r3
jmp .loop

.right 
imm r3 .vx
add r1 r3
jmp .loop

.vy
DW 0b001_000_00
.vx
DW 0b000_001_00