import express from 'express';

const router = express.Router();

router.get("/send", (req, res) => {
    res.send("send endpoint");
});

router.get("/receive", (req, res) => {
    res.send("receive endpoint");
});

export default router;