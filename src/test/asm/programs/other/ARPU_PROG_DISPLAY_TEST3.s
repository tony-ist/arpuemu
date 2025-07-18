imm r1 0 0b000_000_10
pst r1 0
imm r1 0 1
.loop
pst r1 0
imm r4 0 0b001_001_00
add r1 r4
bra 1 0b10 .end
bra 0 0 .loop

.end
ret 1
