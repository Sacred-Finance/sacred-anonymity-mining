import type { GetContractReturnType, PublicClient, WalletClient } from 'viem'

export const abi = [
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_admins',
        type: 'address[]',
      },
    ],
    name: 'addAdmins',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_moderators',
        type: 'address[]',
      },
    ],
    name: 'addModerators',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'adminAt',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'adminCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAdmins',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getModerators',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'item',
        type: 'address',
      },
    ],
    name: 'isAdmin',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
    ],
    name: 'isGroupRemoved',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
    ],
    name: 'isItemRemoved',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'item',
        type: 'address',
      },
    ],
    name: 'isModerator',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'moderatorAt',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'moderatorCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_admin',
        type: 'address',
      },
    ],
    name: 'removeAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
    ],
    name: 'removeGroup',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256',
      },
      {
        internalType: 'uint256[]',
        name: 'proofSiblings',
        type: 'uint256[]',
      },
      {
        internalType: 'uint8[]',
        name: 'proofPathIndices',
        type: 'uint8[]',
      },
    ],
    name: 'removeGroupMember',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
    ],
    name: 'removeItem',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_moderators',
        type: 'address[]',
      },
    ],
    name: 'removeModerators',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'revokeMyAdminRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'bannerCID',
        type: 'bytes32',
      },
    ],
    name: 'setGroupBanner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'description',
        type: 'string',
      },
    ],
    name: 'setGroupDescription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'description',
            type: 'string',
          },
          {
            internalType: 'bytes32[]',
            name: 'tags',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes32',
            name: 'bannerCID',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'logoCID',
            type: 'bytes32',
          },
        ],
        internalType: 'struct GroupDetails',
        name: 'details',
        type: 'tuple',
      },
    ],
    name: 'setGroupDetails',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'logoCID',
        type: 'bytes32',
      },
    ],
    name: 'setGroupLogo',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: 'tags',
        type: 'bytes32[]',
      },
    ],
    name: 'setGroupTags',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'note',
        type: 'uint256',
      },
    ],
    name: 'NewGroupCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'username',
        type: 'bytes32',
      },
    ],
    name: 'NewUser',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256',
      },
    ],
    name: 'RemovedUser',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'groupName',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct Requirement[]',
        name: 'requirements',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'description',
            type: 'string',
          },
          {
            internalType: 'bytes32[]',
            name: 'tags',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes32',
            name: 'bannerCID',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'logoCID',
            type: 'bytes32',
          },
        ],
        internalType: 'struct GroupDetails',
        name: 'details',
        type: 'tuple',
      },
      {
        internalType: 'uint256',
        name: 'note',
        type: 'uint256',
      },
    ],
    name: 'createGroup',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256',
      },
    ],
    name: 'getUserName',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'groupAt',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            components: [
              {
                internalType: 'string',
                name: 'description',
                type: 'string',
              },
              {
                internalType: 'bytes32[]',
                name: 'tags',
                type: 'bytes32[]',
              },
              {
                internalType: 'bytes32',
                name: 'bannerCID',
                type: 'bytes32',
              },
              {
                internalType: 'bytes32',
                name: 'logoCID',
                type: 'bytes32',
              },
            ],
            internalType: 'struct GroupDetails',
            name: 'groupDetails',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'tokenAddress',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'minAmount',
                type: 'uint256',
              },
            ],
            internalType: 'struct Requirement[]',
            name: 'requirements',
            type: 'tuple[]',
          },
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'note',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'userCount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'chainId',
            type: 'uint256',
          },
          {
            internalType: 'uint256[]',
            name: 'posts',
            type: 'uint256[]',
          },
          {
            internalType: 'bool',
            name: 'removed',
            type: 'bool',
          },
        ],
        internalType: 'struct Group',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'groupCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'groupDetails',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'description',
            type: 'string',
          },
          {
            internalType: 'bytes32[]',
            name: 'tags',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes32',
            name: 'bannerCID',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'logoCID',
            type: 'bytes32',
          },
        ],
        internalType: 'struct GroupDetails',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
    ],
    name: 'groupRequirements',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'minAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct Requirement[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'groupUsers',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256',
      },
    ],
    name: 'isMemberJoined',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'username',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'note',
        type: 'uint256',
      },
    ],
    name: 'joinGroup',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: '_a',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256[2][2]',
        name: '_b',
        type: 'uint256[2][2]',
      },
      {
        internalType: 'uint256[2]',
        name: '_c',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256',
      },
      {
        internalType: 'uint256[]',
        name: 'proofSiblings',
        type: 'uint256[]',
      },
      {
        internalType: 'uint8[]',
        name: 'proofPathIndices',
        type: 'uint8[]',
      },
    ],
    name: 'leaveGroup',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
    ],
    name: 'postsInGroup',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: '_a',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256[2][2]',
        name: '_b',
        type: 'uint256[2][2]',
      },
      {
        internalType: 'uint256[2]',
        name: '_c',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'bannerCID',
        type: 'bytes32',
      },
    ],
    name: 'setGroupBannerByOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: '_a',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256[2][2]',
        name: '_b',
        type: 'uint256[2][2]',
      },
      {
        internalType: 'uint256[2]',
        name: '_c',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: 'description',
        type: 'string',
      },
    ],
    name: 'setGroupDescriptionByOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: '_a',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256[2][2]',
        name: '_b',
        type: 'uint256[2][2]',
      },
      {
        internalType: 'uint256[2]',
        name: '_c',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'description',
            type: 'string',
          },
          {
            internalType: 'bytes32[]',
            name: 'tags',
            type: 'bytes32[]',
          },
          {
            internalType: 'bytes32',
            name: 'bannerCID',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'logoCID',
            type: 'bytes32',
          },
        ],
        internalType: 'struct GroupDetails',
        name: 'details',
        type: 'tuple',
      },
    ],
    name: 'setGroupDetailsByOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: '_a',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256[2][2]',
        name: '_b',
        type: 'uint256[2][2]',
      },
      {
        internalType: 'uint256[2]',
        name: '_c',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'logoCID',
        type: 'bytes32',
      },
    ],
    name: 'setGroupLogoByOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: '_a',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256[2][2]',
        name: '_b',
        type: 'uint256[2][2]',
      },
      {
        internalType: 'uint256[2]',
        name: '_c',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: 'tags',
        type: 'bytes32[]',
      },
    ],
    name: 'setGroupTagsByOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'enum ItemKind',
        name: 'itemType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'parentId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'contentCID',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'note',
        type: 'uint256',
      },
    ],
    name: 'NewItem',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'enum ItemKind',
        name: 'itemType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'newCID',
        type: 'bytes32',
      },
    ],
    name: 'UpdateItem',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'parentId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'contentCID',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'merkleTreeRoot',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nullifierHash',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'note',
            type: 'uint256',
          },
        ],
        internalType: 'struct ItemCreationRequest',
        name: 'request',
        type: 'tuple',
      },
      {
        internalType: 'uint256[8]',
        name: 'semaphoreProof',
        type: 'uint256[8]',
      },
      {
        internalType: 'bool',
        name: 'asPoll',
        type: 'bool',
      },
      {
        components: [
          {
            internalType: 'enum PollType',
            name: 'pollType',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'answerCount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rateScaleFrom',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rateScaleTo',
            type: 'uint256',
          },
          {
            internalType: 'bytes32[]',
            name: 'answerCIDs',
            type: 'bytes32[]',
          },
        ],
        internalType: 'struct PollRequest',
        name: 'pollRequest',
        type: 'tuple',
      },
    ],
    name: 'addComment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'contentCID',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'merkleTreeRoot',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nullifierHash',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'note',
            type: 'uint256',
          },
        ],
        internalType: 'struct ItemCreationRequest',
        name: 'request',
        type: 'tuple',
      },
      {
        internalType: 'uint256[8]',
        name: 'semaphoreProof',
        type: 'uint256[8]',
      },
      {
        internalType: 'bool',
        name: 'asPoll',
        type: 'bool',
      },
      {
        components: [
          {
            internalType: 'enum PollType',
            name: 'pollType',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'answerCount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rateScaleFrom',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rateScaleTo',
            type: 'uint256',
          },
          {
            internalType: 'bytes32[]',
            name: 'answerCIDs',
            type: 'bytes32[]',
          },
        ],
        internalType: 'struct PollRequest',
        name: 'pollRequest',
        type: 'tuple',
      },
    ],
    name: 'addPost',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: '_a',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256[2][2]',
        name: '_b',
        type: 'uint256[2][2]',
      },
      {
        internalType: 'uint256[2]',
        name: '_c',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'newCID',
        type: 'bytes32',
      },
    ],
    name: 'editItem',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'postId',
        type: 'uint256',
      },
    ],
    name: 'getCommentIdList',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
    ],
    name: 'getPostIdList',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'itemAt',
    outputs: [
      {
        components: [
          {
            internalType: 'enum ItemKind',
            name: 'kind',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'parentId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'groupId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'createdAtBlock',
            type: 'uint256',
          },
          {
            internalType: 'uint256[]',
            name: 'childIds',
            type: 'uint256[]',
          },
          {
            internalType: 'uint256',
            name: 'upvote',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'downvote',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'note',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'contentCID',
            type: 'bytes32',
          },
          {
            internalType: 'bool',
            name: 'removed',
            type: 'bool',
          },
        ],
        internalType: 'struct Item',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'itemCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'pollAt',
    outputs: [
      {
        components: [
          {
            internalType: 'enum PollType',
            name: 'pollType',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'startTime',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'answerCount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'voteCount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rateScaleFrom',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rateScaleTo',
            type: 'uint256',
          },
          {
            internalType: 'uint256[]',
            name: 'results',
            type: 'uint256[]',
          },
          {
            internalType: 'bytes32[]',
            name: 'answerCIDs',
            type: 'bytes32[]',
          },
        ],
        internalType: 'struct Poll',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'enum VoteKind',
        name: 'voteType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'enum ItemKind',
        name: 'itemType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'upvote',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'downvote',
        type: 'uint256',
      },
    ],
    name: 'VoteItem',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'enum PollType',
        name: 'pollType',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
    ],
    name: 'VotePoll',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        internalType: 'enum VoteKind',
        name: 'voteType',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'merkleTreeRoot',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'nullifierHash',
        type: 'uint256',
      },
      {
        internalType: 'uint256[8]',
        name: 'semaphoreProof',
        type: 'uint256[8]',
      },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'itemId',
        type: 'uint256',
      },
      {
        internalType: 'uint256[]',
        name: 'pollData',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256',
        name: 'merkleTreeRoot',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'nullifierHash',
        type: 'uint256',
      },
      {
        internalType: 'uint256[8]',
        name: 'semaphoreProof',
        type: 'uint256[8]',
      },
    ],
    name: 'votePoll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

type ForumABIType = typeof abi
export type ForumContract = GetContractReturnType<
  ForumABIType,
  PublicClient,
  WalletClient
>
