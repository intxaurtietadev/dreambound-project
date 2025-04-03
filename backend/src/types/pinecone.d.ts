declare module '@pinecone-database/pinecone' {
    interface InitConfiguration {
      environment: string;
      apiKey: string;
    }
  
    interface QueryRequest {
      vector: number[];
      topK: number;
      includeMetadata?: boolean;
    }
  
    interface ScoredVector {
      id?: string;
      score?: number;
      metadata?: object;
    }
  
    interface QueryResponse {
      matches?: ScoredVector[];
    }
  
    interface IndexOperations {
      query(params: { queryRequest: QueryRequest }): Promise<QueryResponse>;
    }
  
    class PineconeClient {
      init(configuration: InitConfiguration): Promise<void>;
      Index(indexName: string): IndexOperations;
    }
  
    export = PineconeClient;
  }