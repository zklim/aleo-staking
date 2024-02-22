import { credits } from './credits';

// interfaces
interface approval {
  approver: string;
  spender: string;
}
interface claim {
  owner: string;
  amount: bigint;
  min_claim_height: bigint;
}
interface token {
  owner: string;
  amount: bigint;
}
export class ale {
  // params
  approvals: Map<string, bigint> = new Map();
  totals: Map<bigint, bigint> = new Map();
  account: Map<string, bigint> = new Map();
  static readonly CORE_PROTOCOL = "aleo1v7zqs7fls3ryy8dvtl77ytszk4p9af9mxx2kclq529jd3et7hc8qqlhsq0";
  credits: credits;
  constructor(
    // constructor args
    creditsContract: credits,
  ) {
    // constructor body
    this.credits = creditsContract;
  }
  // TODO: replace with ARC-20 standard, plus burn/mint
// 0u8 -- total minted
// 1u8 -- total burned
  approve_public(
    spender: string,
    amount: bigint,
  ) {
  }
  unapprove_public(
    spender: string,
    amount: bigint,
  ) {
  }
  transfer_from_public(
    approver: string,
    receiver: string,
    amount: bigint,
  ) {
  }
  transfer_public(
    receiver: string,
    amount: bigint,
  ) {
  }
  transfer_private(
    input_record: token,
    receiver: string,
    amount: bigint,
  ) {
  }
  transfer_private_to_public(
    input_record: token,
    receiver: string,
    amount: bigint,
  ) {
  }
  transfer_public_to_private(
    receiver: string,
    amount: bigint,
  ) {
  }
  mint_private(
    amount: bigint,
    receiver: string,
  ) {
  }
  mint_public(
    amount: bigint,
    receiver: string,
  ) {
  }
  burn_private(
    input_record: token,
    ale_burn_amount: bigint,
    credits_claim_amount: bigint,
    min_block_height: u32) -> (,
  ) {
  }
  claim_credits(
    claim_record: claim,
  ) {
  }
  assert_totals(
    total_minted: bigint,
    total_burned: bigint,
  ) {
  }

}