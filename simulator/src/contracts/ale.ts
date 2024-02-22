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
  approve_public() {
  }
  unapprove_public() {
  }
  transfer_from_public() {
  }
  transfer_public() {
  }
  transfer_private() {
  }
  transfer_private_to_public() {
  }
  transfer_public_to_private() {
  }
  mint_private() {
  }
  mint_public() {
  }

}