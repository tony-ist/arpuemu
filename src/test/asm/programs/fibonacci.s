// Calculates Nth fibonacci number

IMM R1 0 1
IMM R2 0 2
IMM R3 0 3
.loop
ADD R1 R2
ADD R2 R1
DEC R3
BRA 0 0b11 .loop
PST R1 0