.loop
cal 0 0 .plot
inc r1 r1
inc r2 r2
bra 1 0b10 .end
bra 0 0 .loop

.end
ret 1

.plot
mov r3 r2
add r3 r3
add r3 r3
add r3 r3
add r3 r3
add r3 r3
mov r4 r1
add r4 r4
add r4 r4
bit r3 r4 0b0010_0000 // OR
inc r3 r3
pst r3 0
ret