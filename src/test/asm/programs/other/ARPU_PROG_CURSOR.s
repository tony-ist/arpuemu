imm r1 0b000_000_10
pst r1 0 // Clear screen
imm r1 0b100_100_01
imm r4 0b100_100_00

.loop
pst r4 0 // Clear old pixel
pst r1 0 // Draw new pixel
mov r4 r1
dec r4 // Remember clear old pixel command
pld r2 0

imm r3 1
sub r3 r2
jz .up

imm r3 0
sub r3 r2
jz .down

imm r3 2
sub r3 r2
jz .left

imm r3 3
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

.vx
DW 0b000_001_00
.vy
DW 0b001_000_00