import { DynamicLogo } from './Logo';

const LoadingPage = () => {
    return (
        <div className='flex items-center justify-center h-screen'>
            <DynamicLogo className='scale-[25%]'/>
        </div>
    );
};

export default LoadingPage;
