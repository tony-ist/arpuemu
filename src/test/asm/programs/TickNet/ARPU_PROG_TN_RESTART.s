// This program restarts the interface, sends DATA_BYTE to the RECIPIENT_ADDR and then receives a packet with single byte of data,
// stores this data in RAM[i++]
// Run ARPU_PROG_TN_ECHO on the other ARPU instance to run tests

// The address of the other CPU where instance of this program is being run
@define RECIPIENT_ADDR 43
// How many times to repeat the restart, send, receive loop
@define MAX_ITERATIONS 3
// Data byte to send over the network
@define DATA_BYTE 255

// Send anything to TN_NEXT_DATA_PORT to get next data byte 
@define TN_NEXT_DATA_PORT 0
// Send TN command to this port
@define TN_COMMAND_PORT 1
// Send data to this port to include data in the packet
@define TN_DATA_PORT 2
// Send recepient address to this port to send the packet
@define TN_RECEPIENT_ADDR_PORT 3

// Send these commands to TN_COMMAND_PORT
// Turn the interface on
@define TN_COMMAND_ON 1
// Turn the interface off
@define TN_COMMAND_OFF 2
// Get the next packet
@define TN_COMMAND_NEXT_PACKET 4

.arpu_tn_restart
imm r2 0 // r2 is current iteration number starting with zero

.loop
cal .restart
cal .send
cal .receive // r1 is result

// Store received byte in RAM
str r1 r2

inc r2
imm r3 @MAX_ITERATIONS
sub r3 r2
jz .halt
jmp .loop

.restart
imm r4 @TN_COMMAND_OFF
pst r4 @TN_COMMAND_PORT // Turn the interface off
imm r4 @TN_COMMAND_ON
pst r4 @TN_COMMAND_PORT // Turn the interface on
ret

.receive // Waits for first non zero packet, returns it in register 1
imm r4 @TN_COMMAND_NEXT_PACKET
pst r4 @TN_COMMAND_PORT // Next packet command
pst r4 @TN_NEXT_DATA_PORT // Write anything to TN_NEXT_DATA_PORT to trigger next data byte command
pld r1 // Read data from input port into r1
mov r1 r1 // Update zero flag
jz .receive // Zero data means that there was no transmission yet, so try again
ret

.send // Send DATA_BYTE to address RECIPIENT_ADDR
imm r4 @DATA_BYTE
pst r4 @TN_DATA_PORT
imm r4 @RECIPIENT_ADDR
pst r4 @TN_RECEPIENT_ADDR_PORT
ret

.halt
imm r4 @TN_COMMAND_OFF
pst r4 @TN_COMMAND_PORT // Turn the interface off
halt
