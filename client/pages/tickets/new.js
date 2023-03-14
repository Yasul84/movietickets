import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const NewTicket = () => {
    const [ title, setTitle ] = useState('');
    const [ price, setPrice ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ maxCount, setMaxCount ] = useState(0);
    const [ currentCount, setCurrentCount ] = useState(0);
    const { doRequest, errors } = useRequest({
        url: '/api/tickets', 
        method: 'post', 
        body: {
            title, price, description, maxCount, currentCount
        }, 
        onSuccess: () => Router.push('/')
    });

    const onBlur = () => {
        const value = parseFloat(price);

        if (isNaN(value)) {
            return;
        }

        setPrice(value.toFixed(2));
    };

    const onSubmit = (e) => {
        e.preventDefault();

        doRequest();
    };

    return(
        <div>
            <h1>Create a ticket</h1>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label>Title:</label>
                     <input className='form-control'value={title} onChange = {(e) => setTitle(e.target.value)} />
                </div>
                <div className='form-group'>
                    <label>Description:</label>
                     <input className='form-control' value={description} onChange = {(e) => setDescription(e.target.value)} />
                </div>
                <div className='form-group'>
                    <label>Price:</label>
                     <input className='form-control' onBlur = {onBlur} value={price} onChange = {(e) => setPrice(e.target.value)} />
                </div>
                <div className='form-group'>
                    <label>Maximum number of tickets for auditorium:</label>
                     <input className='form-control' value={maxCount} onChange = {(e) => setMaxCount(e.target.value)} />
                </div>
                <div className='form-group'>
                    <label>Current count of purchased tickets:</label>
                     <input className='form-control' value={currentCount} onChange = {(e) => setCurrentCount(e.target.value)} />
                </div>
                {errors}
                <button className='btn btn-primary'>Submit</button>
            </form>
        </div>
    );
};

export default NewTicket;