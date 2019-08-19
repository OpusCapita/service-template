import React from 'react';
import { Route } from 'react-router';
import { Containers, Components } from '@opuscapita/service-base-ui';

class TestComponent extends Components.ContextComponent
{
    render()
    {
        return(
            <div>Hello, world!</div>
        )
    }
}

const App = () => (
	<Containers.ServiceLayout serviceName="user">
		<Route path="/blupp" component={TestComponent} />
	</Containers.ServiceLayout>
);

export default App;
