// Sorts an array of length N using insertion sort

PLD R4 0
MOV R1 R4

.input
PLD R2 0
STR R2 R3
INC R3 R3
DEC R1 R1
BRA 0 0b11 .input // if R1 not zero

IMM R3 0 1 // R3 is loop index

.loop1
SOP R3 0 // PUSH R3

.loop2
LOD R2 R3
DEC R3 R3
LOD R1 R3
SUB R2 R1
BRA 1 0b10 .loop2_end // if cout (or) if R1 <= R2
CAL 0 0 .swap // if R1 > R2

.loop2_end
MOV R3 R3
BRA 0 0b11 .loop2 // if R3 != 0

.loop1_end
SOP R3 2 // POP R3
INC R3 R3
MOV R2 R3
SUB R2 R4
BRA 0 0b11 .loop1 // if R3 != R4 (or) not zero

IMM R3 0 0

.output
LOD R2 R3
PST R2 0
INC R3 R3
MOV R2 R3
SUB R2 R4
BRA 0 0b11 .output // if R3 != R4 (or) not zero

.end
RET 1

// swaps RAM[R3] and RAM[R3+1]
.swap
LOD R1 R3
INC R3 R3
LOD R2 R3
STR R1 R3
DEC R3 R3
STR R2 R3
RET