import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

const users = []
const tweets = []

function validateRequests(validate, req) {
	const errorList = []
	const keysValidate =
		validate === "post-/sign-up" ? ["username", "avatar"] : ["tweet"]
	const keys = Object.keys(req.body)
	keys.forEach(key => {
		if (!keysValidate.includes(key))
			errorList.push(`The key "${key}" is not valid`)
	})
	if (!req.body.username && validate === "post-/sign-up")
		errorList.push("username is required")
	if (!req.body.avatar && validate === "post-/sign-up")
		errorList.push("avatar is required")
	if (!req.headers.user && validate === "post-/tweet")
		errorList.push("Header User is required")
	if (!req.body.tweet && validate === "post-/tweet")
		errorList.push("tweet is required")

	return errorList
}

app.post("/sign-up", (req, res) => {
	const validate = validateRequests("post-/sign-up", req)
	if (validate.length === 0) {
		const { username, avatar } = req.body
		const user = {
			id: users.length + 1,
			username,
			avatar,
		}
		users.push(user)
		res.status(201).json("OK")
	} else {
		res.status(400).json({ error: validate })
	}
})

app.post("/tweets", (req, res) => {
	const validate = validateRequests("post-/tweet", req)
	if (validate.length === 0) {
		const { tweet } = req.body
		const { user } = req.headers
		const tweetObj = {
			id: tweets.length + 1,
			username: user,
			tweet,
		}
		tweets.push(tweetObj)
		res.status(201).json("OK")
	} else {
		res.status(400).json({ error: validate })
	}
})

app.get("/tweets", (req, res) => {
	const page = parseInt(req.query.page)
	if (page <= 0)
		return res.status(400).json({
			error: "Invalid page! The number of page must be greater than 0",
		})

	let start = page === 1 ? tweets.length : tweets.length - (page - 1) * 10
	const latestTweets = []
	let count = 10
	if (tweets.length > 0) {
		for (let i = start - 1; i >= 0; i--) {
			if (count === 0) break
			let { avatar } = users.find(
				user => user.username === tweets[i].username
			)
			const lastTweet = {
				username: tweets[i].username,
				avatar: avatar,
				tweet: tweets[i].tweet,
			}
			latestTweets.push(lastTweet)
			count--
		}
		res.status(200).json(latestTweets)
	} else res.json(latestTweets)
})

app.get("/tweets/:USERNAME", (req, res) => {
	const { USERNAME } = req.params
	const userTweets = tweets.filter(tweet => tweet.username === USERNAME)
	res.status(200).json(userTweets)
})

app.listen(5000, () => {
	console.log("Server is running on port 5000")
})