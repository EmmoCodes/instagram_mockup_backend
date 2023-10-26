import { ObjectId } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '../utils/db.js'

const COL = 'posts'

export const addComment = async (req, res) => {
  const userId = req.payload.user
  const postId = req.params.postid
  const comment = req.body
  const db = await getDb()
  const post = await db.collection(COL).findOne({ _id: new ObjectId(postId) })
  comment.owner = userId
  comment.timestamp = new Date()
  comment.comment_id = uuidv4()
  comment.likes = []
  comment.replies = []
  post.comments.push(comment)
  await db.collection(COL).updateOne({ _id: new ObjectId(postId) }, { $set: { ...post } })
  res.end()
}

export const handleCommentLike = async (req, res) => {
  const { nickname } = req.body
  const { postId, commentId } = req.body
  const db = await getDb()
  const post = await db.collection(COL).findOne({ _id: new ObjectId(postId) })

  post.comments.forEach(comment => {
    if (comment.comment_id === commentId && comment.likes.includes(nickname)) {
      const index = comment.likes.indexOf(nickname)
      comment.likes.splice(index, 1)
    } else if (comment.comment_id === commentId && !comment.likes.includes(nickname)) {
      comment.likes.push(nickname)
    }
  })

  await db.collection(COL).updateOne({ _id: new ObjectId(postId) }, { $set: { ...post } })

  res.json(post)
}

export const addReply = async (req, res) => {
  const { nickname, postId, commentId, reply, userId } = req.body
  console.log(userId)
  const db = await getDb()
  const post = await db.collection(COL).findOne({ _id: new ObjectId(postId) })
  post.comments.forEach(comment => {
    if (comment.comment_id === commentId) {
      const replyData = { owner: userId, nickname, reply, timestamp: new Date() }
      comment.replies.push(replyData)
    }
  })
  await db.collection(COL).updateOne({ _id: new ObjectId(postId) }, { $set: { ...post } })
  res.end()
}

export const getComment = async (req, res) => {
  const { postId, commentId } = req.body
  const db = await getDb()
  const post = await db.collection(COL).findOne({ _id: new ObjectId(postId) })
  const commentData = post.comments.filter(comment => {
    if (comment.comment_id === commentId) {
      return comment
    }
  })[0]
  res.json(commentData)
}
