import type {LinkedBundle, SerializableServiceDefinition} from '@devvit/protos'
import type {AssetMap} from '@devvit/shared-types/Assets.js'

type LinkerAssetMaps = {
  /** Standard assets from the /assets project path */
  assets?: AssetMap | undefined
  /** Webview-only assets from the /webroot project path */
  webviewAssets: AssetMap | undefined
}

/**
 * @arg es JavaScript
 * @arg hostname Arbitrary but something unique to the window like
 *               hello-world.local may allow concurrent sessions with the
 *               remote.
 * @param assetMaps Provide maps from relative filenames to their accessible URL
 */
export function link(
  es: string,
  hostname: string,
  assetMaps: LinkerAssetMaps
): LinkedBundle & {products: unknown} {
  // to-do: remove products^ typing once schema is revised.
  return {
    actor: {name: 'pen', owner: 'play', version: '0.0.0.0'},
    assets: assetMaps.assets ?? {},
    webviewAssets: assetMaps.webviewAssets ?? {},
    code: es,
    hostname,
    products: {},
    provides: provides(),
    uses: uses()
  }
}

function provides(): SerializableServiceDefinition[] {
  // Assume the app provides CustomPost and UIEventHandler services to avoid an
  // evaluation phase. Also, Hello for internal tests. These are generated like:
  //   devvit new foo --template=custom-post
  //   cd foo
  //   devvit actor bundle main
  //   node -pe 'JSON.stringify(JSON.parse(require("fs").readFileSync(0, "utf8")).dependencies.provides, null, 2)' < dist/main.bundle.json
  return [
    {
      fullName: 'devvit.actor.hello.Hello',
      methods: [
        {
          fullName: '/devvit.actor.hello.Hello/Ping',
          name: 'Ping',
          requestStream: false,
          responseStream: false,
          requestType: 'devvit.actor.hello.PingMessage',
          responseType: 'devvit.actor.hello.PingMessage'
        }
      ],
      name: 'Hello',
      version: ''
    },
    {
      fullName: 'devvit.reddit.custom_post.v1alpha.CustomPost',
      methods: [
        {
          fullName: '/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPost',
          name: 'RenderPost',
          requestStream: false,
          responseStream: false,
          requestType: 'devvit.reddit.custom_post.v1alpha.RenderPostRequest',
          responseType: 'devvit.reddit.custom_post.v1alpha.RenderPostResponse'
        },
        {
          fullName:
            '/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPostContent',
          name: 'RenderPostContent',
          requestStream: false,
          responseStream: false,
          requestType: 'devvit.ui.block_kit.v1beta.UIRequest',
          responseType: 'devvit.ui.block_kit.v1beta.UIResponse'
        },
        {
          fullName:
            '/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPostComposer',
          name: 'RenderPostComposer',
          requestStream: false,
          responseStream: false,
          requestType: 'devvit.ui.block_kit.v1beta.UIRequest',
          responseType: 'devvit.ui.block_kit.v1beta.UIResponse'
        }
      ],
      name: 'CustomPost',
      version: ''
    },
    {
      fullName: 'devvit.ui.events.v1alpha.UIEventHandler',
      methods: [
        {
          fullName: '/devvit.ui.events.v1alpha.UIEventHandler/HandleUIEvent',
          name: 'HandleUIEvent',
          requestStream: false,
          responseStream: false,
          requestType: 'devvit.ui.events.v1alpha.HandleUIEventRequest',
          responseType: 'devvit.ui.events.v1alpha.HandleUIEventResponse'
        }
      ],
      name: 'UIEventHandler',
      version: ''
    }
  ]
}

function uses(): (LinkedBundle & {products: unknown})[] {
  // to-do: remove products ^ typing once schema is revised.
  // Assume the app uses everything (`Devvit.configure({...})`). play doesn't
  // have an evaluation phase. See provides() for generation notes.
  return [
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'logger.plugins.local',
      provides: [
        {
          fullName: 'devvit.plugin.logger.Logger',
          methods: [
            {
              fullName: '/devvit.plugin.logger.Logger/Error',
              name: 'Error',
              requestType: 'devvit.plugin.logger.LogErrorMessage',
              responseType: 'devvit.plugin.logger.LogErrorResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.logger.Logger/Event',
              name: 'Event',
              requestType: 'devvit.plugin.logger.LogEventMessage',
              responseType: 'devvit.plugin.logger.LogEventResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.logger.Logger/Log',
              name: 'Log',
              requestType: 'devvit.plugin.logger.LogMessage',
              responseType: 'devvit.plugin.logger.LogResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.logger.Logger/LogBatch',
              name: 'LogBatch',
              requestType: 'devvit.plugin.logger.LogMessages',
              responseType: 'devvit.plugin.logger.LogResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Logger',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'http.plugins.local',
      provides: [
        {
          fullName: 'devvit.plugin.http.HTTP',
          methods: [
            {
              fullName: '/devvit.plugin.http.HTTP/Fetch',
              name: 'Fetch',
              requestType: 'devvit.plugin.http.FetchRequest',
              responseType: 'devvit.plugin.http.FetchResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'HTTP',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'kvstore.plugins.local',
      provides: [
        {
          fullName: 'devvit.plugin.kvstore.KVStore',
          methods: [
            {
              fullName: '/devvit.plugin.kvstore.KVStore/Put',
              name: 'Put',
              requestType: 'devvit.plugin.kvstore.MessageSet',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.kvstore.KVStore/Get',
              name: 'Get',
              requestType: 'devvit.plugin.kvstore.KeySet',
              responseType: 'devvit.plugin.kvstore.MessageSet',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.kvstore.KVStore/Del',
              name: 'Del',
              requestType: 'devvit.plugin.kvstore.KeySet',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.kvstore.KVStore/List',
              name: 'List',
              requestType: 'devvit.plugin.kvstore.ListFilter',
              responseType: 'devvit.plugin.kvstore.KeySet',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'KVStore',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'redisapi.plugins.local',
      provides: [
        {
          fullName: 'devvit.plugin.redis.RedisAPI',
          methods: [
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Get',
              name: 'Get',
              requestType: 'devvit.plugin.redis.KeyRequest',
              responseType: 'google.protobuf.StringValue',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Set',
              name: 'Set',
              requestType: 'devvit.plugin.redis.SetRequest',
              responseType: 'google.protobuf.StringValue',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Del',
              name: 'Del',
              requestType: 'devvit.plugin.redis.KeysRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Type',
              name: 'Type',
              requestType: 'devvit.plugin.redis.KeyRequest',
              responseType: 'google.protobuf.StringValue',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/IncrBy',
              name: 'IncrBy',
              requestType: 'devvit.plugin.redis.IncrByRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/HSet',
              name: 'HSet',
              requestType: 'devvit.plugin.redis.HSetRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/HGet',
              name: 'HGet',
              requestType: 'devvit.plugin.redis.HGetRequest',
              responseType: 'google.protobuf.StringValue',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/HGetAll',
              name: 'HGetAll',
              requestType: 'devvit.plugin.redis.KeyRequest',
              responseType: 'devvit.plugin.redis.RedisFieldValues',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/HDel',
              name: 'HDel',
              requestType: 'devvit.plugin.redis.HDelRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/HScan',
              name: 'HScan',
              requestType: 'devvit.plugin.redis.HScanRequest',
              responseType: 'devvit.plugin.redis.HScanResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/HKeys',
              name: 'HKeys',
              requestType: 'devvit.plugin.redis.KeyRequest',
              responseType: 'devvit.plugin.redis.KeysResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/HIncrBy',
              name: 'HIncrBy',
              requestType: 'devvit.plugin.redis.HIncrByRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Multi',
              name: 'Multi',
              requestType: 'devvit.plugin.redis.TransactionId',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Exec',
              name: 'Exec',
              requestType: 'devvit.plugin.redis.TransactionId',
              responseType: 'devvit.plugin.redis.TransactionResponses',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Discard',
              name: 'Discard',
              requestType: 'devvit.plugin.redis.TransactionId',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Watch',
              name: 'Watch',
              requestType: 'devvit.plugin.redis.WatchRequest',
              responseType: 'devvit.plugin.redis.TransactionId',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Unwatch',
              name: 'Unwatch',
              requestType: 'devvit.plugin.redis.TransactionId',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/GetRange',
              name: 'GetRange',
              requestType: 'devvit.plugin.redis.KeyRangeRequest',
              responseType: 'google.protobuf.StringValue',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/SetRange',
              name: 'SetRange',
              requestType: 'devvit.plugin.redis.SetRangeRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Strlen',
              name: 'Strlen',
              requestType: 'devvit.plugin.redis.KeyRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/MGet',
              name: 'MGet',
              requestType: 'devvit.plugin.redis.KeysRequest',
              responseType: 'devvit.plugin.redis.RedisValues',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/MSet',
              name: 'MSet',
              requestType: 'devvit.plugin.redis.KeyValuesRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/Expire',
              name: 'Expire',
              requestType: 'devvit.plugin.redis.ExpireRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ExpireTime',
              name: 'ExpireTime',
              requestType: 'devvit.plugin.redis.KeyRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZAdd',
              name: 'ZAdd',
              requestType: 'devvit.plugin.redis.ZAddRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZCard',
              name: 'ZCard',
              requestType: 'devvit.plugin.redis.KeyRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZRange',
              name: 'ZRange',
              requestType: 'devvit.plugin.redis.ZRangeRequest',
              responseType: 'devvit.plugin.redis.ZMembers',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZRem',
              name: 'ZRem',
              requestType: 'devvit.plugin.redis.ZRemRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZRemRangeByLex',
              name: 'ZRemRangeByLex',
              requestType: 'devvit.plugin.redis.ZRemRangeByLexRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZRemRangeByRank',
              name: 'ZRemRangeByRank',
              requestType: 'devvit.plugin.redis.ZRemRangeByRankRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZRemRangeByScore',
              name: 'ZRemRangeByScore',
              requestType: 'devvit.plugin.redis.ZRemRangeByScoreRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZScore',
              name: 'ZScore',
              requestType: 'devvit.plugin.redis.ZScoreRequest',
              responseType: 'google.protobuf.DoubleValue',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZRank',
              name: 'ZRank',
              requestType: 'devvit.plugin.redis.ZRankRequest',
              responseType: 'google.protobuf.Int64Value',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZIncrBy',
              name: 'ZIncrBy',
              requestType: 'devvit.plugin.redis.ZIncrByRequest',
              responseType: 'google.protobuf.DoubleValue',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redis.RedisAPI/ZScan',
              name: 'ZScan',
              requestType: 'devvit.plugin.redis.ZScanRequest',
              responseType: 'devvit.plugin.redis.ZScanResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'RedisAPI',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'mediaservice.plugins.local',
      provides: [
        {
          fullName: 'devvit.plugin.media.MediaService',
          methods: [
            {
              fullName: '/devvit.plugin.media.MediaService/Upload',
              name: 'Upload',
              requestType: 'devvit.plugin.media.MediaUploadRequest',
              responseType: 'devvit.plugin.media.MediaUploadResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'MediaService',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'modlog.plugins.local',
      provides: [
        {
          fullName: 'devvit.plugin.modlog.Modlog',
          methods: [
            {
              fullName: '/devvit.plugin.modlog.Modlog/Add',
              name: 'Add',
              requestType: 'devvit.plugin.modlog.ModlogRequest',
              responseType: 'devvit.plugin.modlog.ModlogResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Modlog',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'flair.flair.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.flair.Flair',
          methods: [
            {
              fullName:
                '/devvit.plugin.redditapi.flair.Flair/ClearFlairTemplates',
              name: 'ClearFlairTemplates',
              requestType:
                'devvit.plugin.redditapi.flair.ClearFlairTemplatesRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/DeleteFlair',
              name: 'DeleteFlair',
              requestType: 'devvit.plugin.redditapi.flair.DeleteFlairRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.flair.Flair/DeleteFlairTemplate',
              name: 'DeleteFlairTemplate',
              requestType:
                'devvit.plugin.redditapi.flair.DeleteFlairTemplateRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/Flair',
              name: 'Flair',
              requestType: 'devvit.plugin.redditapi.flair.FlairRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.flair.Flair/FlairTemplateOrder',
              name: 'FlairTemplateOrder',
              requestType:
                'devvit.plugin.redditapi.flair.FlairTemplateOrderRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/FlairConfig',
              name: 'FlairConfig',
              requestType: 'devvit.plugin.redditapi.flair.FlairConfigRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/FlairCsv',
              name: 'FlairCsv',
              requestType: 'devvit.plugin.redditapi.flair.FlairCsvRequest',
              responseType: 'devvit.plugin.redditapi.flair.FlairCsvResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/FlairList',
              name: 'FlairList',
              requestType: 'devvit.plugin.redditapi.flair.FlairListRequest',
              responseType: 'devvit.plugin.redditapi.flair.FlairListResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/FlairSelector',
              name: 'FlairSelector',
              requestType: 'devvit.plugin.redditapi.flair.FlairSelectorRequest',
              responseType:
                'devvit.plugin.redditapi.flair.FlairSelectorResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/FlairTemplate',
              name: 'FlairTemplate',
              requestType: 'devvit.plugin.redditapi.flair.FlairTemplateRequest',
              responseType: 'devvit.plugin.redditapi.flair.FlairObject',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/LinkFlair',
              name: 'LinkFlair',
              requestType: 'devvit.plugin.redditapi.flair.LinkFlairRequest',
              responseType: 'devvit.plugin.redditapi.flair.FlairArray',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/SelectFlair',
              name: 'SelectFlair',
              requestType: 'devvit.plugin.redditapi.flair.SelectFlairRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/SetFlairEnabled',
              name: 'SetFlairEnabled',
              requestType:
                'devvit.plugin.redditapi.flair.SetFlairEnabledRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.flair.Flair/UserFlair',
              name: 'UserFlair',
              requestType: 'devvit.plugin.redditapi.flair.LinkFlairRequest',
              responseType: 'devvit.plugin.redditapi.flair.FlairArray',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Flair',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'graphql.graphql.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.graphql.GraphQL',
          methods: [
            {
              fullName: '/devvit.plugin.redditapi.graphql.GraphQL/Query',
              name: 'Query',
              requestType: 'devvit.plugin.redditapi.graphql.QueryRequest',
              responseType: 'devvit.plugin.redditapi.graphql.QueryResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.graphql.GraphQL/PersistedQuery',
              name: 'PersistedQuery',
              requestType:
                'devvit.plugin.redditapi.graphql.PersistedQueryRequest',
              responseType: 'devvit.plugin.redditapi.graphql.QueryResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'GraphQL',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'linksandcomments.linksandcomments.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.linksandcomments.LinksAndComments',
          methods: [
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Comment',
              name: 'Comment',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.CommentRequest',
              responseType:
                'devvit.plugin.redditapi.linksandcomments.JsonWrappedComment',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Del',
              name: 'Del',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.BasicIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/EditUserText',
              name: 'EditUserText',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.CommentRequest',
              responseType:
                'devvit.plugin.redditapi.linksandcomments.JsonWrappedComment',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/FollowPost',
              name: 'FollowPost',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.FollowPostRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Hide',
              name: 'Hide',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.BasicIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Info',
              name: 'Info',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.InfoRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Lock',
              name: 'Lock',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.BasicIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/MarkNSFW',
              name: 'MarkNSFW',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.BasicIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/MoreChildren',
              name: 'MoreChildren',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.MoreChildrenRequest',
              responseType:
                'devvit.plugin.redditapi.linksandcomments.JsonWrappedComment',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Report',
              name: 'Report',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.ReportRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/ReportAward',
              name: 'ReportAward',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.ReportAwardRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Save',
              name: 'Save',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.SaveRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/SendReplies',
              name: 'SendReplies',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.SendRepliesRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/SetContestMode',
              name: 'SetContestMode',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.SetContestModeRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/SetSubredditSticky',
              name: 'SetSubredditSticky',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.SetSubredditStickyRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/SetSuggestedSort',
              name: 'SetSuggestedSort',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.SetSuggestedSortRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Spoiler',
              name: 'Spoiler',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.BasicIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Submit',
              name: 'Submit',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.SubmitRequest',
              responseType:
                'devvit.plugin.redditapi.linksandcomments.SubmitResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Unhide',
              name: 'Unhide',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.BasicIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Unlock',
              name: 'Unlock',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.BasicIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/UnmarkNSFW',
              name: 'UnmarkNSFW',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.BasicIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Unsave',
              name: 'Unsave',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.BasicIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Unspoiler',
              name: 'Unspoiler',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.BasicIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.linksandcomments.LinksAndComments/Vote',
              name: 'Vote',
              requestType:
                'devvit.plugin.redditapi.linksandcomments.VoteRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'LinksAndComments',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'listings.listings.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.listings.Listings',
          methods: [
            {
              fullName: '/devvit.plugin.redditapi.listings.Listings/Best',
              name: 'Best',
              requestType: 'devvit.plugin.redditapi.listings.GetBestRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.listings.Listings/ById',
              name: 'ById',
              requestType: 'devvit.plugin.redditapi.listings.GetByIdRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.listings.Listings/Comments',
              name: 'Comments',
              requestType:
                'devvit.plugin.redditapi.listings.GetCommentsRequest',
              responseType: 'devvit.plugin.redditapi.listings.ListingResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.listings.Listings/Duplicates',
              name: 'Duplicates',
              requestType:
                'devvit.plugin.redditapi.listings.GetDuplicatesRequest',
              responseType: 'devvit.plugin.redditapi.listings.ListingResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.listings.Listings/Hot',
              name: 'Hot',
              requestType: 'devvit.plugin.redditapi.listings.GetHotRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.listings.Listings/New',
              name: 'New',
              requestType: 'devvit.plugin.redditapi.listings.GetNewRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.listings.Listings/Rising',
              name: 'Rising',
              requestType: 'devvit.plugin.redditapi.listings.GetRisingRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.listings.Listings/Sort',
              name: 'Sort',
              requestType: 'devvit.plugin.redditapi.listings.GetSortRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Listings',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'moderation.moderation.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.moderation.Moderation',
          methods: [
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/AboutLog',
              name: 'AboutLog',
              requestType: 'devvit.plugin.redditapi.moderation.AboutLogRequest',
              responseType:
                'devvit.plugin.redditapi.moderation.AboutLogResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/AboutLocation',
              name: 'AboutLocation',
              requestType:
                'devvit.plugin.redditapi.moderation.AboutLocationRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/AboutReports',
              name: 'AboutReports',
              requestType:
                'devvit.plugin.redditapi.moderation.AboutLocationRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/AboutSpam',
              name: 'AboutSpam',
              requestType:
                'devvit.plugin.redditapi.moderation.AboutLocationRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/AboutModqueue',
              name: 'AboutModqueue',
              requestType:
                'devvit.plugin.redditapi.moderation.AboutLocationRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/AboutUnmoderated',
              name: 'AboutUnmoderated',
              requestType:
                'devvit.plugin.redditapi.moderation.AboutLocationRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/AboutEdited',
              name: 'AboutEdited',
              requestType:
                'devvit.plugin.redditapi.moderation.AboutLocationRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/AcceptModeratorInvite',
              name: 'AcceptModeratorInvite',
              requestType:
                'devvit.plugin.redditapi.moderation.AcceptModeratorInviteRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/Approve',
              name: 'Approve',
              requestType:
                'devvit.plugin.redditapi.moderation.BasicModerationIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/Distinguish',
              name: 'Distinguish',
              requestType:
                'devvit.plugin.redditapi.moderation.DistinguishRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonRedditObjects',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/IgnoreReports',
              name: 'IgnoreReports',
              requestType:
                'devvit.plugin.redditapi.moderation.BasicModerationIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/LeaveContributor',
              name: 'LeaveContributor',
              requestType:
                'devvit.plugin.redditapi.moderation.BasicModerationIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/LeaveModerator',
              name: 'LeaveModerator',
              requestType:
                'devvit.plugin.redditapi.moderation.BasicModerationIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/MuteMessageAuthor',
              name: 'MuteMessageAuthor',
              requestType:
                'devvit.plugin.redditapi.moderation.BasicModerationIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.moderation.Moderation/Remove',
              name: 'Remove',
              requestType: 'devvit.plugin.redditapi.moderation.RemoveRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/ShowComment',
              name: 'ShowComment',
              requestType:
                'devvit.plugin.redditapi.moderation.BasicModerationIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/SnoozeReports',
              name: 'SnoozeReports',
              requestType:
                'devvit.plugin.redditapi.moderation.SnoozeReportsRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/UnignoreReports',
              name: 'UnignoreReports',
              requestType:
                'devvit.plugin.redditapi.moderation.BasicModerationIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/UnmuteMessageAuthor',
              name: 'UnmuteMessageAuthor',
              requestType:
                'devvit.plugin.redditapi.moderation.BasicModerationIdRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/UnsnoozeReports',
              name: 'UnsnoozeReports',
              requestType:
                'devvit.plugin.redditapi.moderation.SnoozeReportsRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/UpdateCrowdControlLevel',
              name: 'UpdateCrowdControlLevel',
              requestType:
                'devvit.plugin.redditapi.moderation.UpdateCrowdControlLevelRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.moderation.Moderation/Stylesheet',
              name: 'Stylesheet',
              requestType:
                'devvit.plugin.redditapi.moderation.StylesheetRequest',
              responseType: 'google.protobuf.StringValue',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Moderation',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'modnote.modnote.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.modnote.ModNote',
          methods: [
            {
              fullName: '/devvit.plugin.redditapi.modnote.ModNote/GetNotes',
              name: 'GetNotes',
              requestType: 'devvit.plugin.redditapi.modnote.GetNotesRequest',
              responseType: 'devvit.plugin.redditapi.modnote.ModNotesResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.modnote.ModNote/DeleteNotes',
              name: 'DeleteNotes',
              requestType: 'devvit.plugin.redditapi.modnote.DeleteNotesRequest',
              responseType:
                'devvit.plugin.redditapi.modnote.DeleteNotesResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.modnote.ModNote/PostNotes',
              name: 'PostNotes',
              requestType: 'devvit.plugin.redditapi.modnote.PostNotesRequest',
              responseType:
                'devvit.plugin.redditapi.modnote.PostModNotesResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.modnote.ModNote/PostRemovalNote',
              name: 'PostRemovalNote',
              requestType:
                'devvit.plugin.redditapi.modnote.PostRemovalNoteRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.modnote.ModNote/RecentNotes',
              name: 'RecentNotes',
              requestType: 'devvit.plugin.redditapi.modnote.RecentNotesRequest',
              responseType: 'devvit.plugin.redditapi.modnote.ModNotesResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'ModNote',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'newmodmail.newmodmail.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.newmodmail.NewModmail',
          methods: [
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/BulkReadConversations',
              name: 'BulkReadConversations',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BulkReadConversationsRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.BulkReadConversationsResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/GetConversations',
              name: 'GetConversations',
              requestType:
                'devvit.plugin.redditapi.newmodmail.GetConversationsRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.GetConversationsResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/CreateConversation',
              name: 'CreateConversation',
              requestType:
                'devvit.plugin.redditapi.newmodmail.CreateConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.CreateConversationResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/GetConversation',
              name: 'GetConversation',
              requestType:
                'devvit.plugin.redditapi.newmodmail.GetConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.GetConversationResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/CreateConversationMessage',
              name: 'CreateConversationMessage',
              requestType:
                'devvit.plugin.redditapi.newmodmail.CreateConversationMessageRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.CreateConversationMessageResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/ApproveConversation',
              name: 'ApproveConversation',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.ApproveConversationResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/ArchiveConversation',
              name: 'ArchiveConversation',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.ArchiveConversationResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/DisapproveConversation',
              name: 'DisapproveConversation',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.ApproveConversationResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/UnhighlightConversation',
              name: 'UnhighlightConversation',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.HighlightConversationResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/HighlightConversation',
              name: 'HighlightConversation',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.HighlightConversationResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/MuteConversation',
              name: 'MuteConversation',
              requestType:
                'devvit.plugin.redditapi.newmodmail.MuteConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.MuteConversationResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/TempBan',
              name: 'TempBan',
              requestType: 'devvit.plugin.redditapi.newmodmail.TempBanRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.TempBanResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/UnarchiveConversation',
              name: 'UnarchiveConversation',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.ArchiveConversationResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.newmodmail.NewModmail/Unban',
              name: 'Unban',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.TempBanResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/UnmuteConversation',
              name: 'UnmuteConversation',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.MuteConversationResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/UserConversations',
              name: 'UserConversations',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationRequest',
              responseType:
                'devvit.plugin.redditapi.newmodmail.ConversationUserData',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.newmodmail.NewModmail/Read',
              name: 'Read',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationsRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/Subreddits',
              name: 'Subreddits',
              requestType: 'google.protobuf.Empty',
              responseType:
                'devvit.plugin.redditapi.newmodmail.SubredditsResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.newmodmail.NewModmail/Unread',
              name: 'Unread',
              requestType:
                'devvit.plugin.redditapi.newmodmail.BasicConversationsRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.newmodmail.NewModmail/UnreadCount',
              name: 'UnreadCount',
              requestType: 'google.protobuf.Empty',
              responseType:
                'devvit.plugin.redditapi.newmodmail.UnreadCountResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'NewModmail',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'privatemessages.privatemessages.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.privatemessages.PrivateMessages',
          methods: [
            {
              fullName:
                '/devvit.plugin.redditapi.privatemessages.PrivateMessages/Block',
              name: 'Block',
              requestType:
                'devvit.plugin.redditapi.privatemessages.GenericPrivateMessagesRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.privatemessages.PrivateMessages/CollapseMessage',
              name: 'CollapseMessage',
              requestType:
                'devvit.plugin.redditapi.privatemessages.GenericPrivateMessagesRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.privatemessages.PrivateMessages/Compose',
              name: 'Compose',
              requestType:
                'devvit.plugin.redditapi.privatemessages.ComposeRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.privatemessages.PrivateMessages/DelMsg',
              name: 'DelMsg',
              requestType:
                'devvit.plugin.redditapi.privatemessages.GenericPrivateMessagesRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.privatemessages.PrivateMessages/ReadAllMessages',
              name: 'ReadAllMessages',
              requestType:
                'devvit.plugin.redditapi.privatemessages.ReadAllMessagesRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.privatemessages.PrivateMessages/ReadMessage',
              name: 'ReadMessage',
              requestType:
                'devvit.plugin.redditapi.privatemessages.GenericPrivateMessagesRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.privatemessages.PrivateMessages/UnblockSubreddit',
              name: 'UnblockSubreddit',
              requestType:
                'devvit.plugin.redditapi.privatemessages.GenericPrivateMessagesRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.privatemessages.PrivateMessages/UncollapseMessage',
              name: 'UncollapseMessage',
              requestType:
                'devvit.plugin.redditapi.privatemessages.GenericPrivateMessagesRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.privatemessages.PrivateMessages/UnreadMessage',
              name: 'UnreadMessage',
              requestType:
                'devvit.plugin.redditapi.privatemessages.GenericPrivateMessagesRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.privatemessages.PrivateMessages/MessageWhere',
              name: 'MessageWhere',
              requestType:
                'devvit.plugin.redditapi.privatemessages.MessageWhereRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'PrivateMessages',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'subreddits.subreddits.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.subreddits.Subreddits',
          methods: [
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/AboutWhere',
              name: 'AboutWhere',
              requestType:
                'devvit.plugin.redditapi.subreddits.AboutWhereRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/DeleteSrBanner',
              name: 'DeleteSrBanner',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSubredditRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/DeleteSrHeader',
              name: 'DeleteSrHeader',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSubredditRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/DeleteSrIcon',
              name: 'DeleteSrIcon',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSubredditRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/DeleteSrImg',
              name: 'DeleteSrImg',
              requestType:
                'devvit.plugin.redditapi.subreddits.DeleteSrImgRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SearchRedditNames',
              name: 'SearchRedditNames',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSearchRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SearchRedditNamesResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SearchSubreddits',
              name: 'SearchSubreddits',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSearchRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SearchSubredditsResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SiteAdmin',
              name: 'SiteAdmin',
              requestType:
                'devvit.plugin.redditapi.subreddits.SiteAdminRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubmitText',
              name: 'SubmitText',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSubredditRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubmitTextResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditAutocomplete',
              name: 'SubredditAutocomplete',
              requestType:
                'devvit.plugin.redditapi.subreddits.SubredditAutocompleteRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditAutocompleteResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditStylesheet',
              name: 'SubredditStylesheet',
              requestType:
                'devvit.plugin.redditapi.subreddits.SubredditStylesheetRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/Subscribe',
              name: 'Subscribe',
              requestType:
                'devvit.plugin.redditapi.subreddits.SubscribeRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/UploadSrImg',
              name: 'UploadSrImg',
              requestType:
                'devvit.plugin.redditapi.subreddits.UploadSrImgRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.UploadSrImgResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditPostRequirements',
              name: 'SubredditPostRequirements',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSubredditRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditPostRequirementsResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditAbout',
              name: 'SubredditAbout',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSubredditRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditAboutResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditAboutEdit',
              name: 'SubredditAboutEdit',
              requestType:
                'devvit.plugin.redditapi.subreddits.SubredditAboutEditRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditAboutEditResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditAboutRules',
              name: 'SubredditAboutRules',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSubredditRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditAboutRulesResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditAboutTraffic',
              name: 'SubredditAboutTraffic',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSubredditRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditAboutTrafficResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/Sidebar',
              name: 'Sidebar',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicSubredditRequest',
              responseType: 'google.protobuf.StringValue',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.subreddits.Subreddits/Sticky',
              name: 'Sticky',
              requestType: 'devvit.plugin.redditapi.subreddits.StickyRequest',
              responseType: 'devvit.plugin.redditapi.subreddits.StickyResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditsMineWhere',
              name: 'SubredditsMineWhere',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicWhereRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditsSearch',
              name: 'SubredditsSearch',
              requestType:
                'devvit.plugin.redditapi.subreddits.SubredditsSearchRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditsSearchResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditsWhere',
              name: 'SubredditsWhere',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicWhereRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditsSearchResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/UsersSearch',
              name: 'UsersSearch',
              requestType:
                'devvit.plugin.redditapi.subreddits.UsersSearchRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.UserSearchResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/UsersWhere',
              name: 'UsersWhere',
              requestType:
                'devvit.plugin.redditapi.subreddits.BasicWhereRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditsSearchResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditAddRemovalReason',
              name: 'SubredditAddRemovalReason',
              requestType:
                'devvit.plugin.redditapi.subreddits.SubredditAddRemovalReasonRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditAddRemovalReasonResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.subreddits.Subreddits/SubredditGetRemovalReasons',
              name: 'SubredditGetRemovalReasons',
              requestType:
                'devvit.plugin.redditapi.subreddits.SubredditGetRemovalReasonsRequest',
              responseType:
                'devvit.plugin.redditapi.subreddits.SubredditGetRemovalReasonsResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Subreddits',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'postcollections.postcollections.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.postcollections.PostCollections',
          methods: [
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/Collection',
              name: 'Collection',
              requestType:
                'devvit.plugin.redditapi.postcollections.CollectionRequest',
              responseType:
                'devvit.plugin.redditapi.postcollections.CollectionResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/SubredditCollections',
              name: 'SubredditCollections',
              requestType:
                'devvit.plugin.redditapi.postcollections.SubredditCollectionsRequest',
              responseType:
                'devvit.plugin.redditapi.postcollections.SubredditCollectionsResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/Create',
              name: 'Create',
              requestType:
                'devvit.plugin.redditapi.postcollections.CreateCollectionRequest',
              responseType:
                'devvit.plugin.redditapi.postcollections.CollectionResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/Delete',
              name: 'Delete',
              requestType:
                'devvit.plugin.redditapi.postcollections.DeleteCollectionRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/AddPost',
              name: 'AddPost',
              requestType:
                'devvit.plugin.redditapi.postcollections.AddPostToCollectionRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/RemovePost',
              name: 'RemovePost',
              requestType:
                'devvit.plugin.redditapi.postcollections.RemovePostInCollectionRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/Follow',
              name: 'Follow',
              requestType:
                'devvit.plugin.redditapi.postcollections.FollowCollectionRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/Reorder',
              name: 'Reorder',
              requestType:
                'devvit.plugin.redditapi.postcollections.ReorderCollectionRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/UpdateTitle',
              name: 'UpdateTitle',
              requestType:
                'devvit.plugin.redditapi.postcollections.UpdateCollectionTitleRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/UpdateDescription',
              name: 'UpdateDescription',
              requestType:
                'devvit.plugin.redditapi.postcollections.UpdateCollectionDescriptionRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.postcollections.PostCollections/UpdateDisplayLayout',
              name: 'UpdateDisplayLayout',
              requestType:
                'devvit.plugin.redditapi.postcollections.UpdateCollectionDisplayLayoutRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'PostCollections',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'users.users.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.users.Users',
          methods: [
            {
              fullName: '/devvit.plugin.redditapi.users.Users/BlockUser',
              name: 'BlockUser',
              requestType: 'devvit.plugin.redditapi.users.BlockUserRequest',
              responseType: 'devvit.plugin.redditapi.users.BlockUserResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.users.Users/Friend',
              name: 'Friend',
              requestType: 'devvit.plugin.redditapi.users.FriendRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.users.Users/ReportUser',
              name: 'ReportUser',
              requestType: 'devvit.plugin.redditapi.users.ReportUserRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.users.Users/SetPermissions',
              name: 'SetPermissions',
              requestType:
                'devvit.plugin.redditapi.users.SetPermissionsRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.users.Users/Unfriend',
              name: 'Unfriend',
              requestType: 'devvit.plugin.redditapi.users.UnfriendRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.users.Users/UserDataByAccountIds',
              name: 'UserDataByAccountIds',
              requestType:
                'devvit.plugin.redditapi.users.UserDataByAccountIdsRequest',
              responseType:
                'devvit.plugin.redditapi.users.UserDataByAccountIdsResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.users.Users/UsernameAvailable',
              name: 'UsernameAvailable',
              requestType:
                'devvit.plugin.redditapi.users.UsernameAvailableRequest',
              responseType: 'google.protobuf.BoolValue',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.users.Users/UnfriendUser',
              name: 'UnfriendUser',
              requestType: 'devvit.plugin.redditapi.users.GenericUsersRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.users.Users/GetFriendInformation',
              name: 'GetFriendInformation',
              requestType: 'devvit.plugin.redditapi.users.GenericUsersRequest',
              responseType:
                'devvit.plugin.redditapi.users.GeneralFriendResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.users.Users/UpdateFriendRelationship',
              name: 'UpdateFriendRelationship',
              requestType:
                'devvit.plugin.redditapi.users.UpdateFriendRelationshipRequest',
              responseType:
                'devvit.plugin.redditapi.users.GeneralFriendResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.users.Users/UserTrophies',
              name: 'UserTrophies',
              requestType: 'devvit.plugin.redditapi.users.GenericUsersRequest',
              responseType:
                'devvit.plugin.redditapi.users.UserTrophiesResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.users.Users/UserAbout',
              name: 'UserAbout',
              requestType: 'devvit.plugin.redditapi.users.UserAboutRequest',
              responseType: 'devvit.plugin.redditapi.users.UserAboutResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.users.Users/UserWhere',
              name: 'UserWhere',
              requestType: 'devvit.plugin.redditapi.users.UserWhereRequest',
              responseType: 'devvit.plugin.redditapi.common.Listing',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Users',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'widgets.widgets.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.widgets.Widgets',
          methods: [
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/AddButtonWidget',
              name: 'AddButtonWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.AddButtonWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.ButtonWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/AddImageWidget',
              name: 'AddImageWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.AddImageWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.ImageWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/AddCalendarWidget',
              name: 'AddCalendarWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.AddCalendarWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.CalendarWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/AddTextAreaWidget',
              name: 'AddTextAreaWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.AddTextAreaWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.TextAreaWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/AddCommunityListWidget',
              name: 'AddCommunityListWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.AddCommunityListWidgetRequest',
              responseType:
                'devvit.plugin.redditapi.widgets.CommunityListWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/AddPostFlairWidget',
              name: 'AddPostFlairWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.AddPostFlairWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.PostFlairWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/AddCustomWidget',
              name: 'AddCustomWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.AddCustomWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.CustomWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.widgets.Widgets/DeleteWidget',
              name: 'DeleteWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.DeleteWidgetRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/UpdateButtonWidget',
              name: 'UpdateButtonWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.UpdateButtonWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.ButtonWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/UpdateImageWidget',
              name: 'UpdateImageWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.UpdateImageWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.ImageWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/UpdateCalendarWidget',
              name: 'UpdateCalendarWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.UpdateCalendarWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.CalendarWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/UpdateTextAreaWidget',
              name: 'UpdateTextAreaWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.UpdateTextAreaWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.TextAreaWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/UpdateCommunityListWidget',
              name: 'UpdateCommunityListWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.UpdateCommunityListWidgetRequest',
              responseType:
                'devvit.plugin.redditapi.widgets.UpdateCommunityListWidgetResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/UpdatePostFlairWidget',
              name: 'UpdatePostFlairWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.UpdatePostFlairWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.PostFlairWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/UpdateCustomWidget',
              name: 'UpdateCustomWidget',
              requestType:
                'devvit.plugin.redditapi.widgets.UpdateCustomWidgetRequest',
              responseType: 'devvit.plugin.redditapi.widgets.CustomWidget',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.widgets.Widgets/GetWidgetImageUploadLease',
              name: 'GetWidgetImageUploadLease',
              requestType:
                'devvit.plugin.redditapi.widgets.GetWidgetImageUploadLeaseRequest',
              responseType:
                'devvit.plugin.redditapi.widgets.GetWidgetImageUploadLeaseResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.widgets.Widgets/OrderWidgets',
              name: 'OrderWidgets',
              requestType:
                'devvit.plugin.redditapi.widgets.OrderWidgetsRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.widgets.Widgets/GetWidgets',
              name: 'GetWidgets',
              requestType: 'devvit.plugin.redditapi.widgets.GetWidgetsRequest',
              responseType:
                'devvit.plugin.redditapi.widgets.GetWidgetsResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Widgets',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'wiki.wiki.redditapi.system.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapi.wiki.Wiki',
          methods: [
            {
              fullName: '/devvit.plugin.redditapi.wiki.Wiki/GetWikiPages',
              name: 'GetWikiPages',
              requestType: 'devvit.plugin.redditapi.wiki.GetWikiPagesRequest',
              responseType: 'devvit.plugin.redditapi.wiki.GetWikiPagesResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.wiki.Wiki/GetWikiPage',
              name: 'GetWikiPage',
              requestType: 'devvit.plugin.redditapi.wiki.GetWikiPageRequest',
              responseType: 'devvit.plugin.redditapi.wiki.GetWikiPageResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.wiki.Wiki/EditWikiPage',
              name: 'EditWikiPage',
              requestType: 'devvit.plugin.redditapi.wiki.EditWikiPageRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.wiki.Wiki/HideWikiPageRevision',
              name: 'HideWikiPageRevision',
              requestType:
                'devvit.plugin.redditapi.wiki.HideWikiPageRevisionRequest',
              responseType:
                'devvit.plugin.redditapi.wiki.HideWikiPageRevisionResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.wiki.Wiki/GetWikiPageRevisions',
              name: 'GetWikiPageRevisions',
              requestType:
                'devvit.plugin.redditapi.wiki.GetWikiPageRevisionsRequest',
              responseType:
                'devvit.plugin.redditapi.wiki.WikiPageRevisionListing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.wiki.Wiki/GetWikiRevisions',
              name: 'GetWikiRevisions',
              requestType:
                'devvit.plugin.redditapi.wiki.GetWikiRevisionsRequest',
              responseType:
                'devvit.plugin.redditapi.wiki.WikiPageRevisionListing',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.wiki.Wiki/RevertWikiPage',
              name: 'RevertWikiPage',
              requestType: 'devvit.plugin.redditapi.wiki.RevertWikiPageRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.wiki.Wiki/GetWikiPageSettings',
              name: 'GetWikiPageSettings',
              requestType:
                'devvit.plugin.redditapi.wiki.GetWikiPageSettingsRequest',
              responseType: 'devvit.plugin.redditapi.wiki.WikiPageSettings',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapi.wiki.Wiki/UpdateWikiPageSettings',
              name: 'UpdateWikiPageSettings',
              requestType:
                'devvit.plugin.redditapi.wiki.UpdateWikiPageSettingsRequest',
              responseType: 'devvit.plugin.redditapi.wiki.WikiPageSettings',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.redditapi.wiki.Wiki/AllowEditor',
              name: 'AllowEditor',
              requestType: 'devvit.plugin.redditapi.wiki.AllowEditorRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Wiki',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'redditapiv2.plugins.local',
      provides: [
        {
          fullName: 'devvit.plugin.redditapiv2.RedditAPIV2',
          methods: [
            {
              fullName:
                '/devvit.plugin.redditapiv2.RedditAPIV2/GetSubredditCollections',
              name: 'GetSubredditCollections',
              requestType:
                'devvit.plugin.redditapi.postcollections.SubredditCollectionsRequest',
              responseType:
                'devvit.plugin.redditapi.postcollections.SubredditCollectionsResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.redditapiv2.RedditAPIV2/DeleteFlairTemplate',
              name: 'DeleteFlairTemplate',
              requestType:
                'devvit.plugin.redditapi.flair.DeleteFlairTemplateRequest',
              responseType: 'devvit.plugin.redditapi.common.JsonStatus',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'RedditAPIV2',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'scheduler.plugins.local',
      provides: [
        {
          fullName: 'devvit.plugin.scheduler.Scheduler',
          methods: [
            {
              fullName: '/devvit.plugin.scheduler.Scheduler/Schedule',
              name: 'Schedule',
              requestType: 'devvit.plugin.scheduler.ScheduledActionRequest',
              responseType: 'devvit.plugin.scheduler.ScheduledActionResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.scheduler.Scheduler/Cancel',
              name: 'Cancel',
              requestType: 'devvit.plugin.scheduler.CancelActionRequest',
              responseType: 'google.protobuf.Empty',
              requestStream: false,
              responseStream: false
            },
            {
              fullName: '/devvit.plugin.scheduler.Scheduler/List',
              name: 'List',
              requestType: 'devvit.plugin.scheduler.ListActionRequest',
              responseType: 'devvit.plugin.scheduler.ListActionResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Scheduler',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'settings.plugins.local',
      provides: [
        {
          fullName: 'devvit.plugin.settings.v1alpha.Settings',
          methods: [
            {
              fullName: '/devvit.plugin.settings.v1alpha.Settings/GetSettings',
              name: 'GetSettings',
              requestType: 'devvit.plugin.settings.v1alpha.SettingsRequest',
              responseType: 'devvit.plugin.settings.v1alpha.SettingsResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'Settings',
          version: ''
        }
      ]
    },
    {
      actor: {name: 'default', owner: 'devvit', version: '1.0.0'},
      hostname: 'assetresolver.plugins.local',
      provides: [
        {
          fullName: 'devvit.plugin.assetresolver.AssetResolver',
          methods: [
            {
              fullName:
                '/devvit.plugin.assetresolver.AssetResolver/GetAssetURL',
              name: 'GetAssetURL',
              requestType: 'devvit.plugin.assetresolver.GetAssetURLRequest',
              responseType: 'devvit.plugin.assetresolver.GetAssetURLResponse',
              requestStream: false,
              responseStream: false
            },
            {
              fullName:
                '/devvit.plugin.assetresolver.AssetResolver/GetAssetURLs',
              name: 'GetAssetURLs',
              requestType:
                'devvit.plugin.assetresolver.GetMultipleAssetURLsRequest',
              responseType:
                'devvit.plugin.assetresolver.GetMultipleAssetURLsResponse',
              requestStream: false,
              responseStream: false
            }
          ],
          name: 'AssetResolver',
          version: ''
        }
      ]
    }
  ].map(partial => ({
    ...partial,
    assets: {},
    code: '',
    products: {},
    uses: [],
    webviewAssets: {}
  }))
}
