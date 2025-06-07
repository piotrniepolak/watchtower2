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

  async createDiscussion(discussionData: InsertDiscussion) {
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
        content: discussionReplies.content,
        authorId: discussionReplies.authorId,
        discussionId: discussionReplies.discussionId,
        parentReplyId: discussionReplies.parentReplyId,
        upvotes: discussionReplies.upvotes,
        downvotes: discussionReplies.downvotes,
        createdAt: discussionReplies.createdAt,
        updatedAt: discussionReplies.updatedAt,
        author: {
          id: users.id,
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

  async createDiscussionReply(replyData: InsertDiscussionReply) {
    const [reply] = await db
      .insert(discussionReplies)
      .values(replyData)
      .returning();

    // Update discussion reply count and last activity
    await db
      .update(discussions)
      .set({
        replyCount: sql`${discussions.replyCount} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(discussions.id, replyData.discussionId));

    return reply;
  }

  async voteOnDiscussion(userId: string, discussionId: number, voteType: 'up' | 'down') {
    // Check if user has already voted
    const existingVote = await db
      .select()
      .from(discussionVotes)
      .where(
        and(
          eq(discussionVotes.userId, userId),
          eq(discussionVotes.discussionId, discussionId)
        )
      );

    if (existingVote.length > 0) {
      // Update existing vote
      await db
        .update(discussionVotes)
        .set({ voteType })
        .where(
          and(
            eq(discussionVotes.userId, userId),
            eq(discussionVotes.discussionId, discussionId)
          )
        );
    } else {
      // Create new vote
      await db
        .insert(discussionVotes)
        .values({
          userId,
          discussionId,
          voteType,
        });
    }

    // Update discussion vote counts
    const upvoteCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(discussionVotes)
      .where(
        and(
          eq(discussionVotes.discussionId, discussionId),
          eq(discussionVotes.voteType, 'up')
        )
      );

    const downvoteCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(discussionVotes)
      .where(
        and(
          eq(discussionVotes.discussionId, discussionId),
          eq(discussionVotes.voteType, 'down')
        )
      );

    await db
      .update(discussions)
      .set({
        upvotes: upvoteCount[0].count,
        downvotes: downvoteCount[0].count,
      })
      .where(eq(discussions.id, discussionId));
  }

  async voteOnReply(userId: string, replyId: number, voteType: 'up' | 'down') {
    // Check if user has already voted
    const existingVote = await db
      .select()
      .from(discussionVotes)
      .where(
        and(
          eq(discussionVotes.userId, userId),
          eq(discussionVotes.replyId, replyId)
        )
      );

    if (existingVote.length > 0) {
      // Update existing vote
      await db
        .update(discussionVotes)
        .set({ voteType })
        .where(
          and(
            eq(discussionVotes.userId, userId),
            eq(discussionVotes.replyId, replyId)
          )
        );
    } else {
      // Create new vote
      await db
        .insert(discussionVotes)
        .values({
          userId,
          replyId,
          voteType,
        });
    }

    // Update reply vote counts
    const upvoteCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(discussionVotes)
      .where(
        and(
          eq(discussionVotes.replyId, replyId),
          eq(discussionVotes.voteType, 'up')
        )
      );

    const downvoteCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(discussionVotes)
      .where(
        and(
          eq(discussionVotes.replyId, replyId),
          eq(discussionVotes.voteType, 'down')
        )
      );

    await db
      .update(discussionReplies)
      .set({
        upvotes: upvoteCount[0].count,
        downvotes: downvoteCount[0].count,
      })
      .where(eq(discussionReplies.id, replyId));
  }
}

export const discussionStorage = new DiscussionStorage();