# ARPU Emulator

This project is a browser-based assembler and emulator for ARPU Minecraft CPU.

ISA and specs can be found here: https://docs.google.com/spreadsheets/d/1fgOYbUqzb0BNM6QNNpZwxJNMLgwfejtJXb5Xk7rqf3A/edit?usp=sharing

## TODO
- Halt emulator, disable step on halt
- Linting
- Error validation, display line number, also handle illegal alias errors
- Persistence via local storage / code history
- Handle word overflow
- Stack overflow error
- Use context in EmulatorControls, get rid of some function and state in MainPage
- Display inline comments in assembly code

### UI Components
- **Program memory hex view**
- **RAM hex view**
- **Stack hex view**
- **Registers (R1-R4, PC)**
- **Flags**
- **Ports**
- Display
- Console