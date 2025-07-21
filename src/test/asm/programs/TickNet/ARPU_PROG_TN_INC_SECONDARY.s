// This program sends a number between instances of 2 ARPUs, which increment the number on every iteration and send it back
// This is a SECONDARY version of the program, this first waits for a number to arrive, then sends number + 1 to the other cpu and so on
// If failed to receive MAX_RECEIVE_ATTEMPTS times it terminates

// The address of the other CPU where instance of this program is being run
@define RECIPIENT_ADDR 42
// How many times to try to receive before halting
@define MAX_RECEIVE_ATTEMPTS 5

// Send anything to TN_NEXT_DATA_PORT to get next data byte 
@define TN_NEXT_DATA_PORT 0
// Send TN command to this port
@define TN_COMMAND_PORT 1
// Send data to this port to include data in the packet
@define TN_DATA_PORT 2
// Send recipient address to this port to send the packet
@define TN_RECEPIENT_ADDR_PORT 3

// Send these commands to TN_COMMAND_PORT
// Turn the interface on
@define TN_COMMAND_ON 1
// Turn the interface off
@define TN_COMMAND_OFF 2
// Get the next packet
@define TN_COMMAND_NEXT_PACKET 4

.arpu_tn_inc_secondary
imm r4 @TN_COMMAND_ON
pst r4 @TN_COMMAND_PORT // Turn the TN interface on

.loop
cal .receive
inc r1
cal .send
jmp .loop

.receive // Waits for first non zero packet, returns it in register 1, if failed to receive MAX_RECEIVE_ATTEMPTS, it halts the cpu
imm r2 1
.receive_loop
imm r4 @TN_COMMAND_NEXT_PACKET
pst r4 @TN_COMMAND_PORT // Next packet command
pst r4 @TN_NEXT_DATA_PORT // Write anything to TN_NEXT_DATA_PORT to trigger next data byte command
pld r4 // Read data from input port into r4
imm r3 @MAX_RECEIVE_ATTEMPTS
sub r3 r2
jz .halt
inc r2
mov r4 r4 // Update zero flag
jz .receive_loop // Zero data means that there was no transmission yet, so try again
mov r1 r4
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