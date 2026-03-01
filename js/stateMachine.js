export class StateMachine {

    constructor(initialState, possibleStates, context) {
        this.context = context;
        this.states = possibleStates;
        this.currentState = null;
        this.transition(initialState);
    }

    transition(newState, payload = null) {

        if (this.currentState && this.states[this.currentState].exit) {
            this.states[this.currentState].exit(this.context);
        }

        this.currentState = newState;

        if (this.states[this.currentState].enter) {
            this.states[this.currentState].enter(this.context, payload);
        }
    }

    update(delta) {
        if (!this.currentState) return;
        this.states[this.currentState].update(this.context, delta);
    }
}