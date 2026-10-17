import {it,expect} from 'vitest';import {render,screen,fireEvent} from '@testing-library/react';
import ReadingGarden from './ReadingGarden';import {stories} from './adventures';
it('requires all comprehension answers, keeps wrong answers retryable and persists completion',()=>{
 render(<ReadingGarden/>);fireEvent.click(screen.getByRole('button',{name:'阅读：去月亮的车票'}));
 expect(localStorage.getItem('hanzi-reading-v1')).toBeNull();
 const story=stories[0];fireEvent.click(screen.getByRole('button',{name:`第1题：${story.questions[0].options[1]}`}));expect(screen.getByText('再读一读线索，你可以重新选择。')).toBeInTheDocument();
 for(const [i,q] of story.questions.entries())fireEvent.click(screen.getByRole('button',{name:`第${i+1}题：${q.answer}`}));
 expect(JSON.parse(localStorage.getItem('hanzi-reading-v1')!)).toEqual([story.id]);
 expect(screen.getByText('这篇的小问题都完成啦！')).toBeInTheDocument();
});
it('filters difficulty without claiming official grade mapping',()=>{render(<ReadingGarden/>);fireEvent.change(screen.getByRole('combobox',{name:'阅读难度'}),{target:{value:'3'}});expect(screen.queryByRole('button',{name:'阅读：去月亮的车票'})).not.toBeInTheDocument();expect(screen.getAllByRole('button',{name:/^阅读：/})).toHaveLength(3);});
