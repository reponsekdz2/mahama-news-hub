import React, { useState } from 'react';
import { Poll as PollType, PollOption } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { castVote } from '../services/pollService.ts';

interface PollProps {
  initialPoll: PollType;
}

const Poll: React.FC<PollProps> = ({ initialPoll }) => {
  const { isLoggedIn, user } = useAuth();
  const { t } = useLanguage();
  const [poll, setPoll] = useState(initialPoll);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');

  const handleVote = async () => {
    if (!user?.token || !selectedOption) return;
    setIsVoting(true);
    setError('');
    
    // Optimistic update
    const originalPoll = poll;
    const newPoll = { ...poll, userVote: selectedOption, totalVotes: (poll.totalVotes ?? 0) + 1,
      options: poll.options.map(opt => opt.id === selectedOption ? { ...opt, voteCount: (opt.voteCount ?? 0) + 1 } : opt)
    };
    setPoll(newPoll);

    try {
      const updatedPoll = await castVote(poll.id, selectedOption, user.token);
      setPoll(updatedPoll); // Sync with server response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cast vote.');
      setPoll(originalPoll); // Revert on error
    } finally {
      setIsVoting(false);
    }
  };

  const hasVoted = !!poll.userVote;
  const canVote = isLoggedIn && !hasVoted;

  const PollResults: React.FC<{ options: PollOption[], totalVotes: number }> = ({ options, totalVotes }) => (
    <div className="space-y-2 mt-4">
      {options.map(option => {
        const percentage = totalVotes > 0 ? ((option.voteCount ?? 0) / totalVotes) * 100 : 0;
        const isUserChoice = poll.userVote === option.id;
        return (
          <div key={option.id}>
            <div className={`flex justify-between items-center text-sm mb-1 ${isUserChoice ? 'font-bold text-accent-700 dark:text-accent-300' : 'text-gray-700 dark:text-gray-300'}`}>
                <span>{option.option_text}</span>
                <span>{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-accent-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        )
      })}
       <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-2">{t('totalVotes')}: {totalVotes.toLocaleString()}</p>
    </div>
  );

  return (
    <div className="my-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('poll')}: {poll.question}</h3>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      {hasVoted || !isLoggedIn ? (
         <PollResults options={poll.options} totalVotes={poll.totalVotes ?? 0} />
      ) : (
        <div className="mt-4 space-y-3">
          {poll.options.map(option => (
            <button key={option.id} onClick={() => setSelectedOption(option.id)} className={`w-full text-left p-3 rounded-md border-2 transition-all ${selectedOption === option.id ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-accent-400'}`}>
              {option.option_text}
            </button>
          ))}
          <button onClick={handleVote} disabled={!selectedOption || isVoting} className="w-full mt-3 px-4 py-2 bg-accent-600 text-white rounded-md font-semibold hover:bg-accent-700 disabled:opacity-50">
            {isVoting ? 'Voting...' : t('vote')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Poll;