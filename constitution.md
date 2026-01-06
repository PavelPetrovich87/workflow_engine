High Level Design: The Pipeline State Machine

Goal: Build a "headless" workflow engine that can execute complex, multi-step agentic pipelines in the browser with resume capability and policy enforcement.



📚 1. Learning Prerequisites

Before writing code, review these concepts to ensure "Library Author" quality implementation.

A. Graph Theory (The Backbone)



Concepts: Directed Acyclic Graphs (DAG), Topological Sort, Cycle Detection.

Why: You cannot execute a pipeline if you don't know the order of dependencies.

Reading:

Topological Sort in 4 Minutes (Video or equivalent article).

Introduction to Algorithms (CLRS): Section on Graph Algorithms (if you want the deep theory).

TS Graph Implementation: Look at graphology or ts-graph source code for inspiration on storage (Adjacency List vs. Matrix).

B. State Machines (The Brain)



Concepts: Finite State Machines (FSM), Statecharts (Parallel States), Transitions, Guards.

Why: An agent pipeline isn't just "Running" or "Done". It's "Waiting for Input", "Retrying", "Rolling Back".

Reading:

XState Documentation: Systems: Even if we don't use XState, their docs are the gold standard for theory.

Pattern: The State Pattern (Gang of Four).

C. Design Patterns (The Tools)



Visitor Pattern: For separation of algorithm from the grap structure (e.g., a "Validator" visitor vs. an "Executor" visitor).

Strategy Pattern: To swap out how a step executes (e.g., HttpStrategy vs. MockStrategy vs. AgentStrategy).

Observer Pattern: To support reactive UI updates without tight coupling.



🏗️ 2. System Architecture

Core Modules



Definitions (/core/def): Zod schemas defining what a "Node", "Edge", and "Pipeline" are.

The Engine (/core/engine): The "Runner". It accepts a Pipeline Definition and emits events.

TopologicalSorter: Flattens the DAG into an execution plan.

Scheduler: Manages concurrency (e.g., "Run A and B in parallel, then run C").

The Store (/core/store): The Source of Truth.

Persists executionId, nodeStates, context (variables).

Syncs to localStorage for resume capability.

Visualizer (/ui): A React component that subscribes to the Store and renders the graph (using React Flow or generic SVG).


3. Diagram
 ```mermaid

flowchart TD
    subgraph consumer ["Consumer Layer (The Host)"]
      UI["UI / React Component"]
      ClientCode["Client Integration Code"]
    end

    subgraph core ["Core Engine (The Brain)"]
      API["Public API / Facade"]
      Scheduler["Scheduler / Orchestrator"]
      Store["State Store (Observable)"]
    end

    subgraph execution ["Execution Layer (The Hands)"]
      Executor["Node Executor"]
      Registry["Node Handler Registry"]
    end

    subgraph infra ["Infrastructure (The Disk)"]
      PersistenceAdapter["LocalStorage Adapter"]
    end

    %% Flow
    UI -->|"(1) start/resume"| API
    API -->|"(2) init state"| Store
    API -->|"(3) run sequence"| Scheduler
    
    Scheduler -->|"(4) fetch next"| Store
    Scheduler -->|"(5) execute node"| Executor
    
    Executor -->|"(6) resolve handler"| Registry
    Executor -->|"(7) update status"| Store
    
    Store -->|"(8) notify UI"| UI
    Store -.->|"(9) persistence"| PersistenceAdapter

```
Here i will provide a learning material which would be great to use during the implementation.

### Разбор компонентов:

1. **Public API (Facade):**
    
    - Это то, с чем общается разработчик. Методы: `loadDefinition()`, `start()`, `pause()`, `resume()`.
        
    - Он скрывает сложность внутри.
        
2. **State Store (Observable):**
    
    - **Сердце системы.** Здесь лежит `nodesStatus`, `context` (переменные) и `executionId`.
        
    - Важно: Он излучает события. UI обновляется _реактивно_, подписываясь на стор.
        
3. **Scheduler (Topological Sorter):**
    
    - Он не выполняет код. Он смотрит на граф и говорит: "Так, узел А готов, узлы Б и В ждут. Запускаем А".
        
4. **Node Executor & Registry:**
    
    - Это "Руки". Scheduler кидает сюда задачу "Выполни HTTP запрос".
        
    - Registry находит нужную функцию (Strategy) и выполняет её. Это позволяет легко мокать тесты (вместо реального API вызывать фейковый).

``` typescript
export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';
export type NodeStatus = 'pending' | 'running' | 'skipped' | 'success' | 'failure';

export interface NodeState {
  // id можно не хранить внутри, так как он есть ключ в Record, но для удобства можно оставить
  status: NodeStatus; 
  // Используем unknown вместо any для безопасности (Best Practice), 
  // но any допустим для прототипа.
  output?: any;      
  error?: string; // Упростим до строки или объекта ошибки
  attempts: number; 
  startedAt?: number; // Полезно для таймаутов
}

// 3. Глобальный стейт
export interface WorkflowExecutionState {
  executionId: string;
  status: ExecutionStatus;
  
  // !!! ПРОПУСК 1: Контекст (Память)
  // Мы обсуждали, что данные передаются между шагами. 
  // Где-то нужно хранить глобальные переменные или результаты, агрегированные по ходу.
  context: Record<string, any>; 

  // Состояние каждой ноды
  nodeStates: Record<string, NodeState>;
}

interface NodeTypeHandler {
  type: string;
  handler: any;
}

// 1. Что возвращает любой хендлер?
export interface NodeHandlerResult {
  output: unknown; // Результат работы (данные)
  // Можно добавить метаданные, например:
  // metrics?: { duration: number };
}

// 2. Сам контракт Хендлера
// TConfig позволяет нам типизировать конфиг для конкретного хендлера
export interface NodeTypeHandler<TConfig = any> {
  execute(config: TConfig, context: Record<string, any>): Promise<NodeHandlerResult>;
}

// 3. Регистр стратегий обработчиков нод
export class ExecutorRegistry {
  // Храним не any, а интерфейс
  private handlers: Record<string, NodeTypeHandler> = {};

  register(type: string, handler: NodeTypeHandler) {
    if (this.handlers[type]) {
      console.warn(`Overwriting handler for type: ${type}`);
    }
    this.handlers[type] = handler;
  }

  // Метод execute теперь четко знает, что принимать
  async execute(
    type: string, 
    config: any, 
    context: Record<string, any>
  ): Promise<NodeHandlerResult> {
    const handler = this.handlers[type];
    
    if (!handler) {
      throw new Error(`No handler registered for type: ${type}`);
    }

    try {
      // Движок безопасно вызывает метод, зная контракт
      return await handler.execute(config, context);
    } catch (err) {
      // Здесь можно обернуть ошибку в системный тип
      throw new Error(`Error executing node type ${type}: ${(err as Error).message}`);
    }
  }
}

// Хендлер для HTTP запросов
interface HttpConfig {
  url: string;
  method: 'GET' | 'POST';
}

const httpHandler: NodeTypeHandler<HttpConfig> = {
  async execute(config, context) {
    // TypeScript знает, что у config есть .url!
    const response = await fetch(config.url, { method: config.method });
    const json = await response.json();
    
    return { output: json };
  }
};

// Регистрация
const registry = new ExecutorRegistry();
registry.register('http-request', httpHandler);


interface RetryPolicy {
  maxAttempts: number;      // Например, 3
  initialDelayMs: number;   // Например, 1000 (1 сек)
  backoffMultiplier: number; // Например, 2 (1сек -> 2сек -> 4сек)
}

// Вспомогательная функция паузы (чтобы не писать setTimeout вручную)
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function executeWithRetry<T>(
  fn: () => Promise<T>, 
  policy: RetryPolicy
): Promise<T> {
  let attempt = 1;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      // Если попытки кончились — пробрасываем ПОСЛЕДНЮЮ ошибку
      if (attempt >= policy.maxAttempts) {
        throw error; 
      }
      
      // Логируем (в реальном проекте)
      console.warn(`Attempt ${attempt} failed. Retrying...`);

      const delay = policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attempt - 1);
      
      await sleep(delay);
      attempt++;
    }
  }
}


class WorkflowEngine {
  // ... state, registry, scheduler ...

  /**
   * Главный метод. Вызывается один раз при старте, 
   * и рекурсивно каждый раз, когда меняется стейт.
   */
  async tick() {
    // 1. Проверяем, не остановлен ли движок
    if (this.state.status === 'failed' || this.state.status === 'completed') {
      return;
    }

    // 2. Ищем кандидатов
    const readyNodes = this.scheduler.findNextNodes(this.state);

    // 3. Если работы нет, проверяем завершение
    if (readyNodes.length === 0) {
      const isRunning = Object.values(this.state.nodeStates)
        .some(n => n.status === 'running');
      
      if (!isRunning) {
        // Ничего не бежит и нечего запустить -> Конец
        this.completeWorkflow();
      }
      return; 
    }

    // 4. ЗАПУСК (Fire and Forget)
    // Мы НЕ делаем await Promise.all. Мы запускаем их "в фон"
    readyNodes.forEach(node => {
      this.startNodeExecution(node);
    });
  }

  // Вынесенная логика исполнения одной ноды
  private async startNodeExecution(node: NodeDef) {
    // A. Optimistic Update: Помечаем как running и сохраняем
    this.state.nodeStates[node.id] = { 
      ...this.state.nodeStates[node.id], 
      status: 'running',
      attempts: 0 
    };
    this.persist(); // Сохранили, что начали

    try {
      // B. Выполняем с ретраями
      const result = await executeWithRetry(
        () => this.registry.execute(node.type, node.config, this.state.context),
        node.retryPolicy || this.defaultPolicy
      );

      // C. УСПЕХ
      this.state.nodeStates[node.id] = {
        status: 'success',
        output: result.output,
        attempts: 1 // или взять из результата
      };
      
      // ! ВАЖНО: Обновляем контекст (память)
      // this.state.context = { ...this.state.context, ...result.output };

    } catch (error) {
      // D. ПРОВАЛ (Graceful handling)
      console.error(`Node ${node.id} failed`, error);
      this.state.nodeStates[node.id] = {
        status: 'failure',
        error: (error as Error).message,
        attempts: 3
      };
      // Тут можно решить: фейлить весь воркфлоу или нет
      // this.state.status = 'failed';
    }

    // E. PERSIST & NEXT TICK
    // Сохраняем результат
    this.persist();
    
    // ! МАГИЯ: Запускаем новый тик, чтобы проверить, 
    // не разблокировались ли новые ноды благодаря этому успеху.
    this.tick(); 
  }

  private persist() {
    localStorage.setItem('workflow-id', JSON.stringify(this.state));
  }
}




```