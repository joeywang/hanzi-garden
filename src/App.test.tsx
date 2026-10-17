import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,cleanup,fireEvent,waitFor} from '@testing-library/react';import userEvent from '@testing-library/user-event';
import App from './App';import {storageKey} from './progress';
vi.mock('./WritingPad',()=>({default:({onWatched,onWritten}:{onWatched:()=>void;onWritten:()=>void})=><div><button onClick={onWatched}>测试看完笔顺</button><button onClick={onWritten}>测试写完</button></div>}));
let audio:HTMLAudioElement;
beforeEach(()=>{vi.spyOn(HTMLMediaElement.prototype,'play').mockImplementation(function(this:HTMLAudioElement){audio=this;return Promise.resolve();});vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('saves character exploration only after listening and watching, separately from writing',async()=>{
 const u=userEvent.setup();render(<App/>);await u.click(screen.getByRole('button',{name:/^开始认字/}));
 expect(screen.getByRole('button',{name:/^认识了，下一个/})).toBeDisabled();
 await u.click(screen.getByRole('button',{name:'听一听'}));fireEvent.ended(audio);
 expect(screen.getByRole('button',{name:/^认识了，下一个/})).toBeDisabled();await u.click(screen.getByRole('button',{name:'测试看完笔顺'}));
 await u.click(screen.getByRole('button',{name:/^认识了，下一个/}));
 expect(JSON.parse(localStorage.getItem(storageKey)!).seen).toEqual(['一']);expect(JSON.parse(localStorage.getItem(storageKey)!).written).toEqual([]);
 await u.click(screen.getByRole('button',{name:'测试写完'}));expect(JSON.parse(localStorage.getItem(storageKey)!).written).toEqual(['二']);
});
it('keeps exploration locked and explains a failed recording',async()=>{
 vi.spyOn(HTMLMediaElement.prototype,'play').mockRejectedValue(new Error('unavailable'));const u=userEvent.setup();render(<App/>);await u.click(screen.getByRole('button',{name:/^开始认字/}));await u.click(screen.getByRole('button',{name:'听一听'}));expect(await screen.findByRole('alert')).toHaveTextContent('声音暂时');expect(screen.getByRole('button',{name:/^认识了，下一个/})).toBeDisabled();
});
it('filters character cards without changing the source curriculum',async()=>{
 const u=userEvent.setup();render(<App/>);await u.click(screen.getByRole('button',{name:'汉字卡片'}));await u.type(screen.getByRole('searchbox'),'鱼');await waitFor(()=>expect(screen.getByRole('button',{name:'学习 鱼'})).toBeInTheDocument());expect(screen.queryByRole('button',{name:'学习 一'})).not.toBeInTheDocument();
});
