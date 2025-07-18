// Output Port 0 - Free
// Output Port 1 - TN Command
// Output Port 2 - Data 
// Output Port 3 - Sender address
// Input Port - Data

imm r1 1
pst r1 1 // Turn TN interface on

imm r1 6 
pst r1 2 // Input 6 as data to TN

imm r1 42
pst r1 3 // Send packet to address 42

// imm r1 2
// pst r1 1 // Turn interface off
 
HALT