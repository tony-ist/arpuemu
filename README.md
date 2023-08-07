# ARPU Emulator

This project is a browser-based assembler and emulator for ARPU Minecraft CPU.

ISA and specs can be found here: https://docs.google.com/spreadsheets/d/1fgOYbUqzb0BNM6QNNpZwxJNMLgwfejtJXb5Xk7rqf3A/edit?usp=sharing

## TODO
- Aliases (PUSH R1, POP R1, IMM R1 42, AND/OR/XOR/NAND/NOT/XNOR/NOT, BRA ZERO .address, etc)
- Linting
- Error validation, display line number
- Persistence via local storage / code history
- Handle word overflow
- Stack overflow error
- Stop on BRA 0 0 .end
- Reg and flag names in views
- Use context in EmulatorControls, get rid of some function and state in MainPage
- Display inline comments in assembly code
- Edit RAM
- Adaptive layout (grid?)
- Rename machineCode to binaryData where appropriate

### UI Components
- Program memory hex view
- RAM hex view
- Stack hex view
- Registers (R1-R4, PC)
- Flags
- Ports
- **Display**
- **Console**