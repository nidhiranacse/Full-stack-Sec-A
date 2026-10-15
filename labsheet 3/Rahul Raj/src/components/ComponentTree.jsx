import React from 'react';

/**
 * ComponentTree Component
 * Fulfills the Lab 3 Deliverable: Component Tree Diagram
 * Visually displays the React Component Hierarchy, Hooks Used, and Props Communication Flow.
 */
export default function ComponentTree() {
  return (
    <div className="component-tree-wrapper">
      <div className="tree-intro">
        <h3>🌳 React Component Hierarchy &amp; Props Communication Tree</h3>
        <p>
          Visualization of component architecture, <code>useState</code> &amp; <code>useEffect</code> hooks allocation, and bidirectional communication.
        </p>
      </div>

      <div className="tree-diagram">
        {/* Root App */}
        <div className="tree-node root-node">
          <div className="node-header">
            <span className="node-tag">Root Component</span>
            <h4 className="node-title">&lt;App /&gt;</h4>
          </div>
          <div className="node-body">
            <p><strong>State (useState):</strong> <code>tasks[]</code>, <code>currentFilter</code></p>
            <p><strong>Effects (useEffect):</strong> Load &amp; Persist <code>localStorage('lab3_react_tasks')</code></p>
            <p><strong>Handlers:</strong> <code>handleAddTask</code>, <code>handleToggleTask</code>, <code>handleDeleteTask</code></p>
          </div>
        </div>

        <div className="tree-branches">
          {/* Branch 1: AddTaskForm */}
          <div className="tree-node child-node">
            <div className="node-header">
              <span className="node-tag">Child Component</span>
              <h4 className="node-title">&lt;AddTaskForm /&gt;</h4>
            </div>
            <div className="node-body">
              <p><strong>Internal State:</strong> <code>taskText</code>, <code>priority</code>, <code>category</code>, <code>errorFlag</code></p>
              <p><strong>Incoming Props:</strong> <code>existingTasks</code></p>
              <p><strong>Outgoing Callback:</strong> <code>onAddTask(taskObject)</code></p>
            </div>
          </div>

          {/* Branch 2: FilterTabs */}
          <div className="tree-node child-node">
            <div className="node-header">
              <span className="node-tag">Child Component</span>
              <h4 className="node-title">&lt;FilterTabs /&gt;</h4>
            </div>
            <div className="node-body">
              <p><strong>Incoming Props:</strong> <code>currentFilter</code>, <code>counts&#123;total,active,done&#125;</code></p>
              <p><strong>Outgoing Callback:</strong> <code>onFilterChange(tab)</code>, <code>onClearCompleted()</code></p>
            </div>
          </div>

          {/* Branch 3: TaskList */}
          <div className="tree-node child-node highlight-branch">
            <div className="node-header">
              <span className="node-tag">Child Component (Parent to TaskItem)</span>
              <h4 className="node-title">&lt;TaskList /&gt;</h4>
            </div>
            <div className="node-body">
              <p><strong>Incoming Props:</strong> <code>tasks[]</code>, <code>onToggleTask</code>, <code>onDeleteTask</code></p>
              <div className="sub-tree">
                <div className="tree-node grandchild-node">
                  <span className="node-tag">Grandchild Component</span>
                  <h5 className="node-title">&lt;TaskItem /&gt; (rendered per task)</h5>
                  <p><strong>Incoming Props:</strong> <code>task</code>, <code>onToggle(id)</code>, <code>onDelete(id)</code></p>
                </div>
              </div>
            </div>
          </div>

          {/* Branch 4: TaskMetrics */}
          <div className="tree-node child-node">
            <div className="node-header">
              <span className="node-tag">Child Component</span>
              <h4 className="node-title">&lt;TaskMetrics /&gt;</h4>
            </div>
            <div className="node-body">
              <p><strong>Incoming Props:</strong> <code>tasks[]</code></p>
              <p><strong>Computes:</strong> Total, Active, Completed, Completion Rate %</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
