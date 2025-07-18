imm r1 0 2
imm r2 0 3

.loop
add r1 r2
mov r3 r1
mov r1 r2
mov r2 r3
bra 0 0 .loop