import { 
  discussions, discussionReplies, discussionVotes, users,
  type Discussion, type InsertDiscussion, type DiscussionReply, type InsertDiscussionReply
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export class DiscussionStorage {
  async getDiscussions(limit: number = 20, offset: number = 0, category?: string) {
    let query = db
      .select({
        id: discussions.id,
        title: discussions.title,
        content: discussions.content,
        authorId: discussions.authorId,
        category: discussions.category,
        tags: discussions.tags,
        upvotes: discussions.upvotes,
        downvotes: discussions.downvotes,
        replyCount: discussions.replyCount,
        lastActivityAt: discussions.lastActivityAt,
        createdAt: discussions.createdAt,
        updatedAt: discussions.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(discussions)
      .innerJoin(users, eq(discussions.authorId, users.id))
      .orderBy(desc(discussions.lastActivityAt))
      .limit(limit)
      .offset(offset);

    if (category) {
      query = query.where(eq(discussions.category, category));
    }

    return await query;
  }

  async getDiscussion(id: number) {
    const [discussion] = await db
      .select({
        id: discussions.id,
        title: discussions.title,
        content: discussions.content,
        authorId: discussions.authorId,
        category: discussions.category,
        tags: discussions.tags,
        upvotes: discussions.upvotes,
        downvotes: discussions.downvotes,
        replyCount: discussions.replyCount,
        lastActivityAt: discussions.lastActivityAt,
        createdAt: discussions.createdAt,
        updatedAt: discussions.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(discussions)
      .innerJoin(users, eq(discussions.authorId, users.id))
      .where(eq(discussions.id, id));

    return discussion;
  }

  async createDiscussion(discussionData: InsertDiscussion): Promise<Discussion> {
    const [discussion] = await db
      .insert(discussions)
      .values(discussionData)
      .returning();
    return discussion;
  }

  async getDiscussionReplies(discussionId: number) {
    return await db
      .select({
        id: discussionReplies.id,
        discussionId: discussionReplies.discussionId,
        content: discussionReplies.content,
        authorId: discussionReplies.authorId,
        parentReplyId: discussionReplies.parentReplyId,
        upvotes: discussionReplies.upvotes,
        downvotes: discussionReplies.downvotes,
        createdAt: discussionReplies.createdAt,
        updatedAt: discussionReplies.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(discussionReplies)
      .innerJoin(users, eq(discussionReplies.authorId, users.id))
      .where(eq(discussionReplies.discussionId, discussionId))
      .orderBy(discussionReplies.createdAt);
  }

  async createDiscussionReply(replyData: InsertDiscussionReply): Promise<DiscussionReply> {
    const [reply] = await db
      .insert(discussionReplies)
      .values(replyData)
      .returning();

    // Update reply count and last activity time for the discussion
    await db
      .update(discussions)
      .set({
        replyCount: sql`${discussions.replyCount} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(discussions.id, replyData.discussionId));

    return reply;
  }

  async voteOnDiscussion(userId: number, discussionId: number, voteType: 'up' | 'down'): Promise<void> {
    // Check if user already voted
    const [existingVote] = await db
      .select()
      .from(discussionVotes)
      .where(and(
        eq(discussionVotes.userId, userId),
        eq(discussionVotes.discussionId, discussionId)
      ));

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type
        await db
          .delete(discussionVotes)
          .where(eq(discussionVotes.id, existingVote.id));

        // Update discussion vote count
        await db
          .update(discussions)
          .set({
            upvotes: voteType === 'up' ? sql`${discussions.upvotes} - 1` : discussions.upvotes,
            downvotes: voteType === 'down' ? sql`${discussions.downvotes} - 1` : discussions.downvotes,
          })
          .where(eq(discussions.id, discussionId));
      } else {
        // Change vote type
        await db
          .update(discussionVotes)
          .set({ voteType })
          .where(eq(discussionVotes.id, existingVote.id));

        // Update discussion vote counts
        await db
          .update(discussions)
          .set({
            upvotes: voteType === 'up' ? sql`${discussions.upvotes} + 1` : sql`${discussions.upvotes} - 1`,
            downvotes: voteType === 'down' ? sql`${discussions.downvotes} + 1` : sql`${discussions.downvotes} - 1`,
          })
          .where(eq(discussions.id, discussionId));
      }
    } else {
      // Create new vote
      await db
        .insert(discussionVotes)
        .values({
          userId,
          discussionId,
          voteType,
        });

      // Update discussion vote count
      await db
        .update(discussions)
        .set({
          upvotes: voteType === 'up' ? sql`${discussions.upvotes} + 1` : discussions.upvotes,
          downvotes: voteType === 'down' ? sql`${discussions.downvotes} + 1` : discussions.downvotes,
        })
        .where(eq(discussions.id, discussionId));
    }
  }
}

export const discussionStorage = new DiscussionStorage();