// Set up multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'finyearpro',
        allowed_formats: ['*'],
        resource_type: 'auto'
    }
});

// Add error handling for multer
const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single("file");

// POST route to handle file upload and form submission
app.post("/upload", (req, res) => {
    upload(req, res, async (err) => {
        try {
            console.log("Upload route hit");
            console.log("Request body:", req.body);
            console.log("Request file:", req.file);
            console.log("Request headers:", req.headers);

            if (err) {
                console.error("Multer error:", err);
                return res.status(400).json({
                    success: false,
                    message: "File upload error",
                    error: err.message
                });
            }

            const { username, email, phoneCode, phone } = req.body;

            // Validate required fields
            if (!username || !email || !phoneCode || !phone) {
                console.log("Missing required fields");
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields",
                    receivedFields: { username, email, phoneCode, phone }
                });
            }

            // Check if the file is uploaded
            if (!req.file) {
                console.log("No file uploaded");
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded"
                });
            }

            // Validate file size (5MB limit)
            if (req.file.size > 5 * 1024 * 1024) {
                console.log("File too large");
                return res.status(400).json({
                    success: false,
                    message: "File size exceeds 5MB limit"
                });
            }

            // Prepare file data
            const fileData = {
                filename: req.file.filename,
                url: req.file.path, // Cloudinary URL
                size: req.file.size,
                contentType: req.file.mimetype
            };

            console.log("Prepared file data:", fileData);

            // Create a new document to store in MongoDB
            const newFileUpload = new FileUpload({
                username,
                email,
                phoneCode,
                phone,
                file: fileData,
            });

            // Save the data to MongoDB Atlas
            await newFileUpload.save();
            console.log("Data saved to MongoDB successfully");

            const responseData = {
                success: true,
                message: "File uploaded and data saved successfully to MongoDB Atlas",
                userDetails: { username, email, phoneCode, phone },
                file: req.file,
            };

            console.log("Sending response:", responseData);
            res.status(200).json(responseData);
        } catch (error) {
            console.error("Error in upload route:", error);
            console.error("Error stack:", error.stack);
            
            // Determine the error type and send appropriate response
            let statusCode = 500;
            let errorMessage = "Error processing upload";
            
            if (error.name === 'ValidationError') {
                statusCode = 400;
                errorMessage = "Validation error: " + error.message;
            } else if (error.name === 'MongoError') {
                statusCode = 500;
                errorMessage = "Database error: " + error.message;
            }
            
            res.status(statusCode).json({
                success: false,
                message: errorMessage,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });
}); 