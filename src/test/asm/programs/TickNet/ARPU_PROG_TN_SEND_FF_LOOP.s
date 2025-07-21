// This program sends 0xFF to RECIPIENT_ADDR and waits for an answer. If the answer is 0xFF it sends it again and so on until iteration 255.
// If the answer is not 0xFF then it halts. Keep in mind that 0 answer is the same as no packet due to adapter limitations, so the program will retry on 0 answer.
// If it halts, r1 will contain the last number received over the network.

// The address of the other CPU where instance of this program is being run
@define RECIPIENT_ADDR 43
@define NUMBER_TO_SEND 0xFF
@define MAX_ITERATIONS 255
@define START_ITERATION 0

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

.arpu_tn_send_ff_loop
imm r4 @TN_COMMAND_ON
pst r4 @TN_COMMAND_PORT // Turn the TN interface on

imm r1 @NUMBER_TO_SEND
cal .send
imm r3 @START_ITERATION

.loop
cal .receive
imm r2 @NUMBER_TO_SEND
sub r2 r1
jnz .halt
cal .send
imm r4 @MAX_ITERATIONS
inc r3
sub r4 r3
jnz .loop
jmp .halt

.receive // Waits for first non zero packet, returns it in register 1
imm r4 @TN_COMMAND_NEXT_PACKET
pst r4 @TN_COMMAND_PORT // Next packet command
pst r4 @TN_NEXT_DATA_PORT // Write anything to TN_NEXT_DATA_PORT to trigger next data byte command
pld r2 // Read data from input port into r2
mov r2 r2 // Update zero flag
jz .receive // Zero data means that there was no transmission yet, so try again
mov r1 r2
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