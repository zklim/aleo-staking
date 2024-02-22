import { axel } from './axel';
import { ale } from './ale';
import { credits } from './credits';
import { delegator5 } from './delegator5';
import { delegator4 } from './delegator4';
import { delegator3 } from './delegator3';
import { delegator2 } from './delegator2';
import { delegator1 } from './delegator1';
import { oracle } from './oracle';

// interfaces
interface state {
  stake: bigint;
  reward: bigint;
  performance: bigint;
  unbond_amount: bigint;
  validator: string;
  ideal_portion: bigint;
}
export class core_protocol {
  // params
  protocol_state: Map<bigint, bigint> = new Map();
  last_rebalance_height: Map<bigint, bigint> = new Map();
  core_protocol_balance: Map<bigint, bigint> = new Map();
  delegator_state: Map<string, any> = new Map();
  delegator_performance: Map<string, bigint> = new Map();
  portion_delegator: Map<bigint, string> = new Map();
  boost_pool: Map<string, bigint> = new Map();
  static readonly AXEL = "aleo1fwwj46afvuv7n940zjmkn0vjp3fz3n5vnmz7gqgafxmzuym0w5gqad7hxq";
  static readonly ALE = "aleo1zpy3xyaf40uqt6v42wm8f9kzp7rhzrjy34kv5yyx3va4r9hgcsxstggn0q";
  static readonly CORE_PROTOCOL = "aleo1v7zqs7fls3ryy8dvtl77ytszk4p9af9mxx2kclq529jd3et7hc8qqlhsq0";
  static readonly DELEGATOR_5 = "aleo1xwa8pc6v9zypyaeqe4v65v8kw7mmstq54vnjnc8lwn874nt455rsus6d8n";
  static readonly DELEGATOR_4 = "aleo1zmpnd8p29h0296uxpnmn4qqu9hukr6p4glwk6cpwln8huvdn7q9sl4vr7k";
  static readonly DELEGATOR_3 = "aleo1hhf39eql5d4gvfwyga0trnzrj0cssvlyzt24w9eaczppvya05u9q695djt";
  static readonly DELEGATOR_2 = "aleo16954qfpx6jrtm7u094tz2jqm986w520j6ewe6xeju6ptyer6k5ysyknyxc";
  static readonly DELEGATOR_1 = "aleo1wjgkfxahkpk6u48eu084dwnyenlamuw6k2vvfzxds786pdzntu9s4r9ds4";
  static readonly MINIMUM_BOOST = BigInt(5_000_000u64);
  static readonly PROFITABILITY_TIMEFRAME = BigInt(40_000u32);
  static readonly MINIMUM_BOND_POOL = BigInt(125_000_000u64);
  static readonly PORTION_5 = BigInt(80u128);
  static readonly PORTION_4 = BigInt(110u128);
  static readonly PORTION_3 = BigInt(160u128);
  static readonly PORTION_2 = BigInt(250u128);
  static readonly PORTION_1 = BigInt(400u128);
  static readonly PRECISION_UNSIGNED = BigInt(1000u128);
  static readonly PRECISION = 1000i128;
  axel: axel;
  ale: ale;
  credits: credits;
  delegator5: delegator5;
  delegator4: delegator4;
  delegator3: delegator3;
  delegator2: delegator2;
  delegator1: delegator1;
  oracle: oracle;
  constructor(
    // constructor args
    axelContract: axel,
    aleContract: ale,
    creditsContract: credits,
    delegator5Contract: delegator5,
    delegator4Contract: delegator4,
    delegator3Contract: delegator3,
    delegator2Contract: delegator2,
    delegator1Contract: delegator1,
    oracleContract: oracle,
  ) {
    // constructor body
    this.axel = axelContract;
    this.ale = aleContract;
    this.credits = creditsContract;
    this.delegator5 = delegator5Contract;
    this.delegator4 = delegator4Contract;
    this.delegator3 = delegator3Contract;
    this.delegator2 = delegator2Contract;
    this.delegator1 = delegator1Contract;
    this.oracle = oracleContract;
  }
  // 1 -> 40% of the stake
// 2 -> 25% of the stake
// 3 -> 16% of the stake
// 4 -> 11% of the stake
// 5 -> 8% of the stake
// 0u8 -> total amount of publicly held aleo in the protocol
// should increase with deposits and decrease with bonding those deposits
// should increase with boosting and decrease with final rebonding in the rebalance
// 1u8 -> total amount of aleo pending withdraw
// u8 -> the height at which the last rebalance completed
// should be updated at the end of the rebalance
// used to estimate rewards earned since rebalancing
// protocol controls
// 0u8 ->
// 0u8: protocol functioning as normal
// 1u8: upcoming protocol rebalance
// 2u8: upcoming protocol rebalance unbonding
// 3u8: upcoming protocol mint rewards and protocol fee
// 4u8: upcoming protocol rebalance redistribution
// 10u8: protocol withdraw unbonding in progress

}