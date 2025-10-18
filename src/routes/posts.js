const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const ctrl = require("../controllers/postController");

router.get("/", ctrl.list);
router.get("/new", requireAuth, ctrl.createForm);
router.post("/", requireAuth, ctrl.create);
router.get("/:id", ctrl.detail);
router.get("/:id/edit", requireAuth, ctrl.editForm);
router.post("/:id/edit", requireAuth, ctrl.update); // or use PUT with method-override
router.post("/:id/delete", requireAuth, ctrl.remove); // or use DELETE with method-override

module.exports = router;
