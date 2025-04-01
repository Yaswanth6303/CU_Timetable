const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
  try {
    const { username, password } = req.body;

    if (  
      !process.env.ADMIN_USERNAME ||
      !process.env.ADMIN_PASSWORD ||
      !process.env.JWT_SECRET
    ) {
      console.error("Required environment variables are not defined");
      return res.status(500).json({ message: "Server configuration error" });
    }

    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { username: process.env.ADMIN_USERNAME },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
