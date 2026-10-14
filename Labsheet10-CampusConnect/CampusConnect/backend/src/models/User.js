const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["ADMIN", "STUDENT"],
            default: "STUDENT"
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function () {
    // Don't hash again when passwordHash hasn't changed
    if (!this.isModified("passwordHash")) {
        return;
    }

    // 10 salt rounds
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

// Compare entered password with stored hash
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);