// This program receives a packet from network and sends its first data byte to RECIPIENT_ADDR.
// It also stores the received data byte in RAM[i++] where i is the index of received packet.
// Then it waits for the next packet in a loop.
// Data 0 and no packet is equivalent so it can only receive non zero data.

// The address of the other CPU where instance of this program is being run
@define RECIPIENT_ADDR 42

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

.receive // Waits for first non zero packet, returns it in register 1
imm r4 @TN_COMMAND_NEXT_PACKET
pst r4 @TN_COMMAND_PORT // Next packet command
pst r4 @TN_NEXT_DATA_PORT // Write anything to TN_NEXT_DATA_PORT to trigger next data byte command
pld r4 // Read data from input port 
mov r4 r4 // Update zero flag
jz .receive // Zero data means that there was no transmission yet, so try again
mov r1 r4
ret

.send // Send r1 content to the other address
pst r1 @TN_DATA_PORT
imm r4 @RECIPIENT_ADDR
pst r4 @TN_RECEPIENT_ADDR_PORT
ret

.halt
imm r4 @TN_COMMAND_OFF
pst r4 @TN_COMMAND_PORT // Turn the interface off
halt
