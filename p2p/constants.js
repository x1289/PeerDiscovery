//#region Constants And Defaults
export const MAINNET_PORT = 8333;
export const TESTNET_PORT = 18333;
export const REGTEST_PORT = 18444;

export const MAINNET_START_STRING = 'MAINNET';
export const TESTNET_START_STRING = 'TESTNET';
export const REGTEST_START_STRING = 'REGTEST';

export const MAINNET_START_STRING_HEX = [0xf9, 0xbe, 0xb4, 0xd9];
export const TESTNET_START_STRING_HEX = [0x0b, 0x11, 0x09, 0x07];
export const REGTEST_START_STRING_HEX = [0xfa, 0xbf, 0xb5, 0xda];

export const START_STRINGS = {
  [MAINNET_START_STRING]: MAINNET_START_STRING_HEX,
  [TESTNET_START_STRING]: TESTNET_START_STRING_HEX,
  [REGTEST_START_STRING]: REGTEST_START_STRING_HEX
};

export const MAINNET_MAX_N_BITS = 0x1d00ffff;
export const TESTNET_MAX_N_BITS = 0x1d00ffff;
export const REGTEST_MAX_N_BITS = 0x207fffff;

export const EMPTY_STRING_CHECKSUM_HEX = [0x5d, 0xf6, 0xe0, 0xe2];

export const CHECKSUM_BYTE_COUNT = 4;

export const MAX_SIZE = 0x02000000;

export const COMPACT_SIZE_UINT_16_IDENTIFIER = 0xfd;
export const COMPACT_SIZE_UINT_16_BYTES = 2;

export const COMPACT_SIZE_UINT_32_IDENTIFIER = 0xfe;
export const COMPACT_SIZE_UINT_32_BYTES = 4;

export const COMPACT_SIZE_UINT_64_IDENTIFIER = 0xff;
export const COMPACT_SIZE_UINT_64_BYTES = 8;

//#endregion

//#region Messages
//#region Data Messages
export const COMMAND_NAME_GET_HEADERS = 'getheaders';
export const COMMAND_NAME_GET_BLOCKS = 'getblocks';
export const COMMAND_NAME_MEMPOOL = 'mempool';

export const COMMAND_INV = 'inv';
export const COMMAND_GET_DATA = 'getdata';

export const COMMAND_NAME_HEADERS = 'headers';
export const COMMAND_NAME_TX = 'tx';
export const COMMAND_NAME_BLOCK = 'block';
export const COMMAND_NAME_MERKLE_BLOCK = 'merkleblock';
export const COMMAND_NAME_CMPCT_BLOCK = 'cmpctblock';
export const COMMAND_NAME_SEND_CMPCT = 'sendcmpct';

export const COMMAND_NAME_GET_BLOCK_TXN = 'getblocktxn';
export const COMMAND_NAME_BLOCK_TXN = 'blocktxn';

export const COMMAND_NAME_NOT_FOUND = 'notfound';

export const DATA_COMMANDS = [COMMAND_NAME_GET_HEADERS, COMMAND_NAME_GET_BLOCKS, COMMAND_NAME_MEMPOOL, COMMAND_INV, COMMAND_GET_DATA,
  COMMAND_NAME_HEADERS, COMMAND_NAME_TX, COMMAND_NAME_BLOCK, COMMAND_NAME_MERKLE_BLOCK, COMMAND_NAME_CMPCT_BLOCK, COMMAND_NAME_SEND_CMPCT,
  COMMAND_NAME_GET_BLOCK_TXN, COMMAND_NAME_BLOCK_TXN, COMMAND_NAME_NOT_FOUND];
//#endregion

//#region Control Messages
export const COMMAND_NAME_VERSION = 'version';
export const COMMAND_NAME_VERACK = 'verack';

export const COMMAND_NAME_PING = 'ping';
export const COMMAND_NAME_PONG = 'pong';

export const COMMAND_NAME_GET_ADDR = 'getaddr';
export const COMMAND_NAME_ADDR = 'addr';
export const COMMAND_NAME_ADDR_V2 = 'addrv2';

export const COMMAND_NAME_FEE_FILTER = 'feefilter';

export const COMMAND_NAME_FILTER_LOAD = 'filterload';
export const COMMAND_NAME_FILTER_ADD = 'filteradd';
export const COMMAND_NAME_FILTER_CLEAR = 'filterclear';

export const COMMAND_NAME_ALERT = 'alert';

export const COMMAND_NAME_SEND_ADDR_V2 = 'sendaddrv2';

export const COMMAND_NAME_SEND_HEADERS = 'sendheaders';

export const COMMAND_NAME_REJECT = 'reject';

export const CONTROL_COMMANDS = [COMMAND_NAME_VERSION, COMMAND_NAME_VERACK, COMMAND_NAME_PING, COMMAND_NAME_PONG,
  COMMAND_NAME_GET_ADDR, COMMAND_NAME_ADDR, COMMAND_NAME_ADDR_V2, COMMAND_NAME_FEE_FILTER, COMMAND_NAME_FILTER_LOAD, COMMAND_NAME_FILTER_ADD,
  COMMAND_NAME_FILTER_CLEAR, COMMAND_NAME_ALERT, COMMAND_NAME_SEND_ADDR_V2, COMMAND_NAME_SEND_HEADERS, COMMAND_NAME_REJECT];
//#endregion

export const COMMAND_NAMES = [...DATA_COMMANDS, ...CONTROL_COMMANDS];
//#endregion