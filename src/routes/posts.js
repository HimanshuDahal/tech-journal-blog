const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/postController");

// List all posts (with search support)
router.get("/", ctrl.list);

// New post form
router.get("/new", requireAuth, ctrl.createForm);

// Create post
router.post("/", requireAuth, ctrl.create);

// Post detail
router.get("/:id", ctrl.detail);

// Edit form
router.get("/:id/edit", requireAuth, ctrl.editForm);

// Update post (using POST for simplicity; could also use PUT with method-override)
router.post("/:id/edit", requireAuth, ctrl.update);

// Delete post (using POST for simplicity; could also use DELETE with method-override)
router.post("/:id/delete", requireAuth, ctrl.remove);

module.exports = router;
