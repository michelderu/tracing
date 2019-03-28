<template>
  <div class="row detail">
    <div class="col-sm-12 content-col">
      <h3>{{ metadata.fileName }} ({{ metadata.contentType }})</h3>
      <div class="card">
        <b-tabs card no-fade v-model="tabIndex">
          <b-tab title="Details" active>
            <dl class="row">
              <dt v-show="metadata.collections" class="col-sm-2">Collections</dt>
              <dd v-show="metadata.collections" class="col-sm-10">
                <span v-for="(c, $index) in metadata.collections" :key="$index">
                  {{ c }}<span v-show="$index !== metadata.collections.length - 1">, </span>
                </span>
              </dd>

              <dt class="col-sm-2">Content-Type</dt>
              <dd class="col-sm-10">{{ metadata.contentType }}</dd>

              <dt class="col-sm-2">File Name</dt>
              <dd class="col-sm-10">{{ metadata.fileName }}</dd>

              <dt class="col-sm-2">Format</dt>
              <dd class="col-sm-10">{{ metadata.format }}</dd>

              <dt v-show="metadata.metadataValues" class="col-sm-2">Metadata</dt>
              <dd v-show="metadata.metadataValues" class="col-sm-10">
                <dl class="row">
                  <template v-for="(v, key, $index) in metadata.metadataValues">
                    <dt class="col-sm-2" :key="$index">{{ key }}</dt>
                    <dd class="col-sm-10" :key="$index">{{ v }}</dd>
                  </template>
                </dl>
              </dd>

              <dt v-show="metadata.permissions" class="col-sm-2">Permissions</dt>
              <dd v-show="metadata.permissions" class="col-sm-10">
                <span v-for="(p, $index) in metadata.permissions" :key="$index">
                  {{ p }}<span v-show="$index !== metadata.permissions.length - 1">, </span>
                </span>
              </dd>

              <dt class="col-sm-2">Quality</dt>
              <dd class="col-sm-10">{{ metadata.quality }}</dd>

              <dt class="col-sm-2">Size</dt>
              <dd class="col-sm-10">{{ metadata.size }} bytes</dd>

              <dt class="col-sm-2">Uri</dt>
              <dd class="col-sm-10">{{ metadata.uri }}</dd>
            </dl>
          </b-tab>
          <b-tab title="Preview">
            <div v-if="metadata.format === 'json' && json">
              <friendly-json :json="json"></friendly-json>
            </div>
            <div v-else-if="metadata.format === 'xml' && raw">
              <friendly-xml :xml="raw"></friendly-xml>
            </div>
            <div v-else>
              <view-binary :src="viewUri" :type="metadata.contentType" :title="metadata.fileName">
                <a slot="fallback" class="btn btn-default" :href="downloadUri" target="_blank" download>Download</a>
              </view-binary>
            </div>
          </b-tab>
          <b-tab title="Raw" v-if="raw">
            <pre>{{ raw }}</pre>
          </b-tab>
          <b-tab title="Tracing" v-if="nodes">
            <visjs-graph v-if="tabIndex === 3" :nodes="nodes" :edges="edges" :options="graphOptions" layout="standard" :events="graphEvents"></visjs-graph>
          </b-tab>
        </b-tabs>
      </div>
    </div>

  </div>
</template>

<script>
import mlSimilar from '@/components/ml-similar.vue';
import friendlyJson from '@/components/friendly-json.vue';
import friendlyXml from '@/components/friendly-xml.vue';
import VisjsGraph from "@/components/visjs-graph.vue";
import GraphApi from "@/api/GraphApi.js";

export default {
  name: 'DetailPage',
  components: {
    mlSimilar,
    friendlyJson,
    friendlyXml,
    VisjsGraph
  },
  props: ['type', 'id'],
  data() {
    return {
      tabIndex: 0,
      metadata: {},
      json: undefined,
      raw: undefined,
      nodes: undefined,
      edges: undefined,
      graphOptions: {
        height: '800px',
        zoom: 0.1,
        interaction: {
          hover: false
        },
        nodes: {
          shadow: true,
          shape: 'dot',
          fillcolor: 'LIGHTCORAL'
          
          // shape: 'image',
          // brokenImage: 'images/generic.png',
          // image: 'images/generic.png'
        },
        edges: {
          shadow: true//,
          // arrows: {
          //   to:     {enabled: false, scaleFactor:1, type:'arrow'},
          //   middle: {enabled: false, scaleFactor:1, type:'arrow'},
          //   from:   {enabled: false, scaleFactor:1, type:'arrow'}
          // },
          // smooth: {
          //   enabled: true,
          //   type: 'vertical',
          //   forceDirection: 'none',
          //   roundness: 1.0
          // }
        },
        groups: {
          'http://www.w3.org/ns/prov#Entity': {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf15c', // document
              color: 'ROYALBLUE'
            },
            level: 2
          },
          'http://www.w3.org/ns/prov#Activity': {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf275', // factory
              color: 'SLATEGRAY'
            },
            level: 2
          },
          'http://www.w3.org/ns/prov#Agent': {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf007', // user
              color: 'LIMEGREEN'
            },
            level: 2
          },
          'unknown': {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf192', // dot
              color: 'LIGHTCORAL'
            },
            level: 2
          }
        }
      },
      graphEvents: {
        // click: function(params) {
        //   var nodeId = params.nodes[0];
        //   var edgeId = params.edges[0];
        //   if (nodeId) {
        //     self.selectNode(nodeId);
        //   } else if (edgeId) {
        //     var edge = { ...self.edgesCache[edgeId] };
        //     if (edge) {
        //       if (edge.type === 'SourceKey') {
        //         // edge between costcenters, show costs
        //         self.selectedNode = null;
        //         self.selectedEdge = edge;
        //         // Note: cash flows from bottom to the top of the graph..
        //         self.getCosts(self.selectedEdge.id, self.selectedEdge.to, self.selectedEdge.from);
        //         self.costsFromStart = 0;
        //         self.costsFromEnd = pageLength;
        //         self.costsToStart = 0;
        //         self.costsToEnd = pageLength;
        //       } else {
        //         // edge between P/L item derivates, show target node aggregate
        //         self.selectNode(edge.to);
        //       }
        //     }
        //   }
        // },
        doubleClick: function(params) {
          if (params.nodes[0]) {
            GraphApi.expand(params.nodes).then(response => {
              self.nodes = response.nodes;
              self.edges = response.edges;
            })
          }
        }
      }
    };
  },
  computed: {
    uri() {
      return this.metadata.uri || '';
    },
    profile() {
      return this.$store.state.auth.profile || {};
    },
    viewUri() {
      return '/api/crud/' + this.type + '/' + this.id + '?';
    },
    downloadUri() {
      return this.viewUri + 'download=true';
    }
  },
  created() {
    var self = this;
    this.$store
      .dispatch('crud/' + this.type + '/view', {
        id: this.id,
        view: 'metadata'
      })
      .then(function(response) {
        if (!response.isError) {
          var metadata = JSON.parse(response.response);
          var permissions = [];
          // flatten permissions for simplified display
          metadata.permissions.forEach(function(p) {
            p.capabilities.forEach(function(c) {
              permissions.push(p['role-name'] + ':' + c);
            });
          });
          metadata.permissions = permissions;
          if (metadata.collections.length === 0) {
            delete metadata.collections;
          }
          if (metadata.permissions.length === 0) {
            delete metadata.permissions;
          }
          if (
            metadata.metadataValues &&
            Object.keys(metadata.metadataValues).length === 0
          ) {
            delete metadata.metadataValues;
          }
          self.metadata = metadata;

          if (metadata.format === 'json') {
            self.$store
              .dispatch('crud/' + self.type + '/read', { id: self.id })
              .then(function(response) {
                if (!response.isError) {
                  self.json = JSON.parse(response.response);
                  self.raw = JSON.stringify(self.json, null, 2);
                }
              });
          } else if (metadata.format === 'xml') {
            self.$store
              .dispatch('crud/' + self.type + '/view', {
                id: self.id,
                view: 'indent'
              })
              .then(function(response) {
                if (!response.isError) {
                  self.raw = response.response;
                }
              });
          }
        }
      });
    GraphApi.expand(['final:'+decodeURIComponent(this.id)]).then(response => {
      self.nodes = response.nodes;
      self.edges = response.edges;
    });
  },
  methods: {
    deleteDoc() {
      if (
        window.confirm(
          'This will permanently delete ' +
            this.metadata.fileName +
            ', are you sure?'
        )
      ) {
        const self = this;
        const toast = self.$parent.$refs.toast;
        self.$store
          .dispatch('crud/' + this.type + '/delete', { id: self.id })
          .then(function(response) {
            if (response.isError) {
              toast.showToast('Failed to delete the document', {
                theme: 'error'
              });
            } else {
              toast.showToast('Successfully deleted the document', {
                theme: 'success'
              });
              self.$router.push({
                name: self.previousRoute
                  ? self.previousRoute.name
                  : 'root.search',
                params: {
                  refresh: true,
                  ...(self.previousRoute ? self.previousRoute.params : {})
                }
              });
            }
          });
      }
    }
  }
};
</script>

<style lang="less" scoped>
view-binary {
  display: block;
  height: 600px;
}
</style>
