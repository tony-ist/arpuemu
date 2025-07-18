// Output Port 0 - Free
// Output Port 1 - TN Command
// Output Port 2 - Data 
// Output Port 3 - Sender address
// Input Port - Data

imm r1 1
pst r1 1 // Turn TN interface on

.loop
imm r1 4
pst r1 1 // Next packet command
pst r1 0 // Write anything to port 0 to trigger next data byte command
pld r4 0 // Read data from input port
mov r4 r4 // Update zero flag
jz .loop

imm r1 2
pst r1 1 // Turn interface off

halt