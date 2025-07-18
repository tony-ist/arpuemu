imm r3 0 0b1010
imm r4 0 0b1100
bit r3 r4 0b1001_0000
bra 0 0b11 .end
inc r1 r1
.end
bra 0 0 .end