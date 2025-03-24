// Enable CORS
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST route to handle file upload and form submission
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const { username, email, phoneCode, phone } = req.body;
        console.log("Received request body:", req.body);
        console.log("Received file:", req.file);

        // Check if the file is uploaded
        if (!req.file) {
            console.log("No file uploaded");
            return res.status(400).send("No file uploaded");
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
            message: "File uploaded and data saved successfully to MongoDB Atlas",
            userDetails: { username, email, phoneCode, phone },
            file: req.file,
        };

        console.log("Sending response:", responseData);
        res.status(200).send(responseData);
    } catch (error) {
        console.error("Error in upload route:", error);
        res.status(500).json({
            success: false,
            message: "Error processing upload",
            error: error.message
        });
    }
}); 