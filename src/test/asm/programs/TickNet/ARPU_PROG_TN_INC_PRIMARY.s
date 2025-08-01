// This program sends a number between instances of 2 ARPUs, which increment the number on every iteration and send it back
// This is a PRIMARY version of the program, this first sends the INITIAL_NUMBER to RECIPIENT_ADDR and waits for INITIAL_NUMBER + 1 to arrive back, then sends INITIAL_NUMBER + 2 and so on
// One cycle (from pld to pld) takes about 5 minutes
// So to count from 1 to 25 it takes about 25 / 2 * 5 = 60 minutes

// The address of the other CPU where instance of this program is being run
@define RECIPIENT_ADDR 43
// Initial number to send
@define INITIAL_NUMBER 1
// When this number is reached then HALT the program
@define STOP_NUMBER 254

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

.arpu_tn_inc_primary
imm r4 @TN_COMMAND_ON
pst r4 @TN_COMMAND_PORT // Turn the TN interface on

imm r1 @INITIAL_NUMBER
cal .send

.loop
cal .receive
inc r1
cal .send

imm r2 @STOP_NUMBER
sub r2 r1
jc .loop

cal .halt

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