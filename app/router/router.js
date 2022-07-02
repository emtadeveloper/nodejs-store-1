// const { CategoryApiPrisma } = require("./prisma-api/category.api");
const { HomeRoutes } = require("./api");
const { AdminRoutes } = require("./admin/admin.routes");
const { DeveloperRoutes } = require("./developer.routes");
const { UserAuthRoutes } = require("./user/auth");
// const { blogApiPrisma } = require("./prisma-api/blog.api");
const { VerifyAccessToken, chackRole } = require("../http/middlewares/verifyAccessToken");
const { graphqlHTTP } = require("express-graphql");
const { graphqlConfig } = require("../utils/graphql.config");
const { SupportSectionRouter } = require("./support/support.router");
const router = require("express").Router();


router.use("/user", UserAuthRoutes)
router.use("/admin",VerifyAccessToken, AdminRoutes)
router.use("/developer", DeveloperRoutes)
// router.use("/blogs", blogApiPrisma)
// router.use("/category", CategoryApiPrisma)
router.use("/graphql", graphqlHTTP(graphqlConfig))
router.use("/support", SupportSectionRouter)
router.use("/", HomeRoutes)
module.exports = {
    AllRoutes : router
}