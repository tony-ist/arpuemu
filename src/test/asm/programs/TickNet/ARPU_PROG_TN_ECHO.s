// This program receives a packet from network and sends its first data byte to RECIPIENT_ADDR in a loop
// If no packet was received in MAX_RECEIVE_ATTEMPTS then it halts

// The address of the other CPU where instance of this program is being run
@define RECIPIENT_ADDR 42
// How many times to try to receive before halting
@define MAX_RECEIVE_ATTEMPTS 10

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

.arpu_tn_echo
imm r2 0 // r2 is current iteration number starting with zero

.loop
cal .receive // r1 is result
cal .send

// Store received byte in RAM
str r1 r2

inc r2
jmp .loop

.receive // Waits for first non zero packet, returns it in register 1, if failed to receive MAX_RECEIVE_ATTEMPTS, it halts the cpu
imm r3 1 // r3 is the number of current attempt
.receive_loop
imm r4 @TN_COMMAND_NEXT_PACKET
pst r4 @TN_COMMAND_PORT // Next packet command
pst r4 @TN_NEXT_DATA_PORT // Write anything to TN_NEXT_DATA_PORT to trigger next data byte command
pld r1 // Read first TickNet data byte from input port into register
imm r4 @MAX_RECEIVE_ATTEMPTS
sub r4 r3
jz .halt
inc r3
mov r1 r1 // Update zero flag
jz .receive_loop // Zero data means that there was no transmission yet, so try again
ret

.send // Send r1 content to the other address
pst r1 @TN_DATA_PORT
imm r2 @RECIPIENT_ADDR
pst r2 @TN_RECEPIENT_ADDR_PORT
ret

.halt
imm r4 @TN_COMMAND_OFF
pst r4 @TN_COMMAND_PORT // Turn the interface off
halt
