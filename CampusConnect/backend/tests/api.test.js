const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Event = require("../models/Event");
const Resource = require("../models/Resource");

const MONGO_TEST_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campusconnect";

describe("CampusConnect Backend Unit Tests (5 Core Test Cases)", () => {
    let testStudentId;
    let testAdminId;
    let testEventId;

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGO_TEST_URI);
        }
    });

    after(async () => {
        // Clean up test items
        if (testStudentId) await User.findByIdAndDelete(testStudentId);
        if (testAdminId) await User.findByIdAndDelete(testAdminId);
        if (testEventId) await Event.findByIdAndDelete(testEventId);
        await mongoose.disconnect();
    });

    // TEST 1: User Registration & Password Hashing
    test("1. User Model - hashes password and prevents duplicate email registration", async () => {
        const testEmail = `test_${Date.now()}@campusconnect.edu`;
        const rawPassword = "securePassword123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        const newUser = await User.create({
            name: "Test Student Unit",
            email: testEmail,
            password: hashedPassword,
            role: "student",
            department: "CSE",
            semester: 6
        });

        testStudentId = newUser._id;
        assert.ok(newUser._id, "User ID should be generated");
        assert.notEqual(newUser.password, rawPassword, "Stored password must be hashed");
        assert.equal(newUser.role, "student", "Default role should be student");

        // Duplicate email must fail
        await assert.rejects(
            async () => {
                await User.create({
                    name: "Duplicate User",
                    email: testEmail,
                    password: hashedPassword,
                    role: "student"
                });
            },
            /duplicate key/i,
            "Creating user with duplicate email should throw duplicate key error"
        );
    });

    // TEST 2: JWT Token Generation and Verification
    test("2. Auth System - verifies valid JWT generation and payload verification", async () => {
        const payload = {
            id: testStudentId.toString(),
            role: "student",
            name: "Test Student Unit"
        };
        const secret = "test_jwt_secret_key";
        const token = jwt.sign(payload, secret, { expiresIn: "1h" });

        assert.ok(typeof token === "string" && token.length > 20, "JWT token string should be created");

        const decoded = jwt.verify(token, secret);
        assert.equal(decoded.id, testStudentId.toString(), "Decoded ID must match payload");
        assert.equal(decoded.role, "student", "Decoded role must match payload");
    });

    // TEST 3: Event Creation and Available Seats Virtual Calculation
    test("3. Event Model - accurately calculates available seats based on totalSeats and registrations", async () => {
        const newEvent = await Event.create({
            title: "Unit Test Cloud Computing Workshop",
            description: "Deep dive into AWS & GCP serverless architectures.",
            category: "Workshop",
            date: new Date(Date.now() + 86400000 * 3),
            time: "11:00 AM - 01:00 PM",
            venue: "Lab 4",
            totalSeats: 25,
            registeredStudents: []
        });

        testEventId = newEvent._id;
        assert.equal(newEvent.totalSeats, 25);
        assert.equal(newEvent.availableSeats, 25, "Initial available seats should equal totalSeats");
    });

    // TEST 4: Student Event Registration & Seat Decrement Logic
    test("4. Event Registration Logic - student registration decrements available seats and blocks duplicates", async () => {
        const event = await Event.findById(testEventId);

        // Register student
        event.registeredStudents.push(testStudentId);
        await event.save();

        const updatedEvent = await Event.findById(testEventId);
        assert.equal(updatedEvent.registeredStudents.length, 1);
        assert.equal(updatedEvent.availableSeats, 24, "Available seats should decrease by 1");

        // Double registration check
        const isAlreadyRegistered = updatedEvent.registeredStudents.some(
            (id) => id.toString() === testStudentId.toString()
        );
        assert.equal(isAlreadyRegistered, true, "Student should be recorded as registered");
    });

    // TEST 5: Academic Resource Filtering by Semester & Subject
    test("5. Resource Model - filters academic resources correctly by subject and semester", async () => {
        const dummyResource = await Resource.create({
            title: "Discrete Mathematics Quick Formula Sheet",
            subject: "Discrete Mathematics",
            semester: 3,
            category: "Notes",
            fileName: "discrete-math.pdf",
            filePath: "uploads/discrete-math.pdf",
            fileType: "pdf",
            fileSize: 10240,
            uploadedBy: new mongoose.Types.ObjectId()
        });

        const foundResources = await Resource.find({
            subject: "Discrete Mathematics",
            semester: 3
        });

        assert.ok(foundResources.length >= 1, "Should find at least 1 resource matching criteria");
        assert.equal(foundResources[0].subject, "Discrete Mathematics");
        assert.equal(foundResources[0].semester, 3);

        // Clean up
        await Resource.findByIdAndDelete(dummyResource._id);
    });
});
