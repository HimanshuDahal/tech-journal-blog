const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/postController");

router.get("/", ctrl.list);
router.get("/new", requireAuth, ctrl.createForm);
router.post("/", requireAuth, ctrl.create);
router.get("/:id", ctrl.detail);

module.exports = router;
