import Enmap from "enmap";

export interface ProposalData {
	id: number;
	user: string;
	name: string;
	desc: string;
}

export const proposalDb = new Enmap<number, ProposalData>("proposals");

export interface PollOption {
	id: number;
	name: string;
	votes: string[];
}

export interface PollData {
	id: number;
	name: string;
	voteStart: number;
	voteEnd: number;
	numberOfVotes: number;
	winnerName?: string;
	winnerId?: number;
	options: PollOption[];
	channelId: string;
	messageId: string;
}

export const pollDb = new Enmap<number, PollData>("polls");
