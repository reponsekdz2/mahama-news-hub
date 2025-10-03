const db = require('../config/db');

const createOrUpdatePollForArticle = async (req, res, next) => {
    const { articleId, question, options } = req.body;
    if (!articleId || !question || !options || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'Article ID, question, and at least two options are required.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Find and delete any existing poll for this article to handle updates gracefully
        const [existingPolls] = await connection.query('SELECT id FROM polls WHERE article_id = ?', [articleId]);
        if (existingPolls.length > 0) {
            // The ON DELETE CASCADE constraint in the schema will handle deleting related options and votes
            await connection.query('DELETE FROM polls WHERE id = ?', [existingPolls[0].id]);
        }

        // If the new poll has no question, we just deleted the old one and we're done.
        if (!question.trim()) {
            await connection.commit();
            return res.status(204).send();
        }

        // Create the new poll
        const [pollResult] = await connection.query(
            'INSERT INTO polls (article_id, question) VALUES (?, ?)',
            [articleId, question]
        );
        const pollId = pollResult.insertId;

        // Insert the new options
        const validOptions = options.map(opt => opt.trim()).filter(Boolean);
        if (validOptions.length < 2) {
            throw new Error('At least two valid options are required.');
        }

        for (const optionText of validOptions) {
            await connection.query('INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)', [pollId, optionText]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Poll created/updated successfully', pollId });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

const voteOnPoll = async (req, res, next) => {
    const { pollId } = req.params;
    const { optionId } = req.body;
    const userId = req.user.id;

    if (!optionId) {
        return res.status(400).json({ message: 'Option ID is required.' });
    }

    try {
        await db.query(
            'INSERT INTO poll_votes (user_id, poll_option_id, poll_id) VALUES (?, ?, ?)',
            [userId, optionId, pollId]
        );
        
        // After voting, refetch poll data to send back to the client
        const [polls] = await db.query('SELECT id, question FROM polls WHERE id = ?', [pollId]);
        const poll = polls[0];
        const [options] = await db.query('SELECT id, option_text FROM poll_options WHERE poll_id = ?', [poll.id]);
        
        let totalVotes = 0;
        for (const option of options) {
            const [votes] = await db.query('SELECT COUNT(*) as count FROM poll_votes WHERE poll_option_id = ?', [option.id]);
            option.voteCount = votes[0].count;
            totalVotes += option.voteCount;
        }

        const updatedPollData = {
            ...poll,
            options,
            totalVotes,
            userVote: optionId
        };

        res.status(201).json(updatedPollData);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'User has already voted on this poll.' });
        }
        next(error);
    }
};

module.exports = { createOrUpdatePollForArticle, voteOnPoll };